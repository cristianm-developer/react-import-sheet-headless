import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';
import type { TransformDelta } from './types/transform-delta.js';

function patchCellInRow(
  rows: ValidatedRow[],
  rowIndex: number,
  col: string,
  newValue: unknown,
): ValidatedRow[] {
  return rows.map((row) => {
    if (row.index !== rowIndex) return row;
    const cells: ValidatedCell[] = row.cells.map((cell) =>
      cell.key === col ? { ...cell, value: newValue } : cell,
    );
    return { ...row, cells };
  });
}

export function applyTransformDelta(sheet: Sheet, delta: TransformDelta): Sheet {
  if (!delta.deltas.length) return sheet;
  let rows = [...sheet.rows];
  for (const item of delta.deltas) {
    if (item.row < 0) continue;
    rows = patchCellInRow(rows, item.row, item.col, item.newValue);
  }
  return { ...sheet, rows };
}
