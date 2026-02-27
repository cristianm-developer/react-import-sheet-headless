import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet, ValidatedCell, ValidatedRow } from '../../../types/sheet.js';
import type { TransformDeltaItem, TransformResult } from '../types/transform-delta.js';
import type { TransformProgressDetail } from '../types/transform-progress.js';
import { runCellTransforms } from './cell-transforms.js';
import { runRowTransforms } from './row-transforms.js';
import { runSheetTransforms } from './sheet-transforms.js';
import type { GetCellTransform } from './cell-transforms.js';
import type { GetRowTransform } from './row-transforms.js';
import type { GetSheetTransform } from './sheet-transforms.js';
import { applyTransformDelta } from '../delta-applier.js';

const THROTTLE_MS = 16;
const THROTTLE_PERCENT = 1;
const CHUNK_SIZE = 200;

export interface TransformGetters {
  getCellTransform: GetCellTransform;
  getRowTransform: GetRowTransform;
  getSheetTransform: GetSheetTransform;
}

function createThrottledProgress(
  totalRows: number,
  onProgress: (d: TransformProgressDetail) => void,
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
        phase: 'transforming',
        localPercent,
        currentRow: processed,
        totalRows,
      });
    }
  };
}

function diffRowToDeltas(
  rowIndex: number,
  before: ValidatedRow,
  after: ValidatedRow,
): TransformDeltaItem[] {
  const out: TransformDeltaItem[] = [];
  const beforeCells = new Map(before.cells.map((c) => [c.key, c]));
  for (const cell of after.cells) {
    const prev = beforeCells.get(cell.key);
    if (prev && prev.value !== cell.value) {
      out.push({ row: rowIndex, col: cell.key, newValue: cell.value });
    }
  }
  return out;
}

export async function runTransform(
  sheet: Sheet,
  sheetLayout: SheetLayout,
  getters: TransformGetters,
  onProgress?: (d: TransformProgressDetail) => void,
  signal?: AbortSignal,
): Promise<TransformResult> {
  if (sheet.errors.length > 0) return { deltas: [] };
  const fields = sheetLayout.fields;
  const totalRows = sheet.rows.length;
  const reportProgress = onProgress ? createThrottledProgress(totalRows, onProgress) : () => {};
  const deltas: TransformDeltaItem[] = [];

  for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, totalRows);
    for (let r = i; r < end; r++) {
      const row = sheet.rows[r];
      if (!row || row.errors.length > 0) continue;
      const rowDeltas: TransformDeltaItem[] = [];
      const updatedCells: ValidatedCell[] = [];
      for (const cell of row.cells) {
        const field = fields[cell.key];
        if (!field) {
          updatedCells.push(cell);
          continue;
        }
        const newValue = runCellTransforms(
          cell,
          row,
          field,
          getters.getCellTransform,
        );
        if (newValue !== cell.value) {
          rowDeltas.push({ row: row.index, col: cell.key, newValue });
        }
        updatedCells.push({ ...cell, value: newValue });
      }
      const updatedRow: ValidatedRow = { ...row, cells: updatedCells };
      const afterRow = runRowTransforms(updatedRow, sheetLayout, getters.getRowTransform);
      const rowDiff = diffRowToDeltas(row.index, updatedRow, afterRow);
      deltas.push(...rowDeltas, ...rowDiff);
    }
    reportProgress(end);
  }

  if (onProgress) {
    onProgress({ phase: 'transforming', localPercent: 100, currentRow: totalRows, totalRows });
  }

  const transformedSheet = applyTransformDelta(sheet, { deltas });

  const sheetOut = await runSheetTransforms(
    transformedSheet,
    sheetLayout,
    getters.getSheetTransform,
    signal,
  );
  deltas.push(...sheetOut.deltas);
  const errors = sheetOut.errors.length > 0 ? [...sheetOut.errors] : undefined;
  return { deltas, errors };
}
