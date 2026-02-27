import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../../sanitizer/types/sanitized-sheet.js';
import type { ValidatorDelta, ValidatorErrorDeltaItem } from '../types/validator-delta.js';
import type { ValidatorProgressDetail } from '../types/validator-progress.js';
import { runCellValidators } from './cell-validators.js';
import { runRowValidators } from './row-validators.js';
import { runTableValidation } from './run-table-validation.js';
import type { GetCellValidator } from './cell-validators.js';
import type { GetRowValidator } from './row-validators.js';
import type { GetTableValidator } from './run-table-validation.js';

const THROTTLE_MS = 16;
const THROTTLE_PERCENT = 1;

export interface ValidatorGetters {
  getCellValidator: GetCellValidator;
  getRowValidator: GetRowValidator;
  getTableValidator: GetTableValidator;
}

function createThrottledProgress(
  totalRows: number,
  onProgress: (d: ValidatorProgressDetail) => void,
): (processed: number) => void {
  let lastTime = 0;
  let lastPercent = -1;
  return (processed: number) => {
    const now = Date.now();
    const localPercent = totalRows > 0 ? Math.floor((processed / totalRows) * 100) : 100;
    const shouldEmit =
      now - lastTime >= THROTTLE_MS ||
      localPercent - lastPercent >= THROTTLE_PERCENT ||
      processed >= totalRows;
    if (shouldEmit && totalRows > 0) {
      lastTime = now;
      lastPercent = localPercent;
      onProgress({
        phase: 'validating',
        localPercent,
        currentRow: processed,
        totalRows,
      });
    }
  };
}

export async function runValidation(
  sanitizedSheet: SanitizedSheet,
  sheetLayout: SheetLayout,
  getters: ValidatorGetters,
  onProgress?: (d: ValidatorProgressDetail) => void,
  signal?: AbortSignal,
): Promise<ValidatorDelta> {
  const totalRows = sanitizedSheet.rows.length;
  const fields = sheetLayout.fields;
  const reportProgress = onProgress ? createThrottledProgress(totalRows, onProgress) : () => {};
  const errors: ValidatorErrorDeltaItem[] = [];

  for (let i = 0; i < totalRows; i++) {
    const row = sanitizedSheet.rows[i];
    if (!row) continue;
    for (const cell of row.cells) {
      const field = fields[cell.key];
      if (!field) continue;
      const cellErrors = runCellValidators(cell, row, field, getters.getCellValidator);
      for (const err of cellErrors) {
        errors.push({ rowIndex: row.index, cellKey: cell.key, error: err });
      }
    }
    const rowErrors = runRowValidators(row, sheetLayout, getters.getRowValidator);
    for (const err of rowErrors) {
      errors.push({ rowIndex: row.index, error: err });
    }
    reportProgress(i + 1);
  }

  if (onProgress) {
    onProgress({ phase: 'validating', localPercent: 100, currentRow: totalRows, totalRows });
  }

  const tableErrors = await runTableValidation(
    sanitizedSheet,
    sheetLayout,
    getters.getTableValidator,
    signal,
  );
  errors.push(...tableErrors);

  return { errors };
}
