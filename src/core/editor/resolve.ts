import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';

export function getRowByIndex(
  sheet: Sheet,
  rowIndex: number,
): ValidatedRow | undefined {
  return sheet.rows.find((row) => row.index === rowIndex);
}

export function getCellByKey(
  row: ValidatedRow,
  cellKey: string,
): ValidatedCell | undefined {
  return row.cells.find((cell) => cell.key === cellKey);
}
