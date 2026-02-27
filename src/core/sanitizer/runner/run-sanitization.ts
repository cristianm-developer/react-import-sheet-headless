import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { ConvertedSheet, ConvertedSheetRow, ConvertedSheetCell } from '../../convert/types/converted-sheet.js';
import type { SanitizedSheet } from '../types/sanitized-sheet.js';
import type { SanitizerProgressDetail } from '../types/sanitizer-progress.js';
import { applyValueTypeCasting } from './casting.js';
import { runCellSanitizers } from './cell-sanitizers.js';
import { runRowSanitizers } from './row-sanitizers.js';
import { runSheetSanitizers } from './sheet-sanitizers.js';

const THROTTLE_MS = 16;
const THROTTLE_PERCENT = 1;

export interface SanitizerGetters {
  getCellSanitizer: (name: string) => ((cell: ConvertedSheetCell, row: ConvertedSheetRow, p?: Readonly<Record<string, unknown>>) => ConvertedSheetCell) | undefined;
  getRowSanitizer: (name: string) => ((row: ConvertedSheetRow, p?: Readonly<Record<string, unknown>>) => ConvertedSheetRow | null) | undefined;
  getSheetSanitizer: (name: string) => ((sheet: ConvertedSheet, p?: Readonly<Record<string, unknown>>) => ConvertedSheet) | undefined;
}

function createThrottledProgress(
  totalRows: number,
  onProgress: (d: SanitizerProgressDetail) => void,
): (processed: number) => void {
  let lastTime = 0;
  let lastPercent = -1;
  return (processed: number) => {
    const now = Date.now();
    const localPercent = totalRows > 0 ? Math.floor((processed / totalRows) * 100) : 100;
    const shouldEmit = now - lastTime >= THROTTLE_MS || localPercent - lastPercent >= THROTTLE_PERCENT || processed >= totalRows;
    if (shouldEmit && totalRows > 0) {
      lastTime = now;
      lastPercent = localPercent;
      onProgress({
        phase: 'sanitizing',
        localPercent,
        currentRow: processed,
        totalRows,
      });
    }
  };
}

export function runSanitization(
  convertedSheet: ConvertedSheet,
  sheetLayout: SheetLayout,
  getters: SanitizerGetters,
  onProgress?: (d: SanitizerProgressDetail) => void,
): SanitizedSheet {
  const totalRows = convertedSheet.rows.length;
  const fields = sheetLayout.fields;
  const reportProgress = onProgress ? createThrottledProgress(totalRows, onProgress) : () => {};

  const outRows: ConvertedSheetRow[] = [];
  for (let i = 0; i < totalRows; i++) {
    const row = convertedSheet.rows[i];
    if (!row) continue;
    const cells: ConvertedSheetCell[] = row.cells.map((cell) => {
      const field = fields[cell.key];
      let c = applyValueTypeCasting(cell, field?.valueType);
      if (field) c = runCellSanitizers(c, row, field, getters.getCellSanitizer);
      return c;
    });
    const updatedRow: ConvertedSheetRow = { index: row.index, cells };
    const afterRow = runRowSanitizers(updatedRow, sheetLayout, getters.getRowSanitizer);
    if (afterRow !== null) outRows.push(afterRow);
    reportProgress(i + 1);
  }

  let sheet: ConvertedSheet = {
    ...convertedSheet,
    rows: outRows,
    rowsCount: outRows.length,
  };
  sheet = runSheetSanitizers(sheet, sheetLayout, getters.getSheetSanitizer);
  if (onProgress) onProgress({ phase: 'sanitizing', localPercent: 100, currentRow: totalRows, totalRows });
  return sheet as SanitizedSheet;
}
