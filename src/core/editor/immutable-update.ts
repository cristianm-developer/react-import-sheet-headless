import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';
import { getRowByIndex } from './resolve.js';

export function removeRow(sheet: Sheet, rowIndex: number): Sheet {
  const row = getRowByIndex(sheet, rowIndex);
  if (!row) return sheet;
  const newRows: ValidatedRow[] = sheet.rows
    .filter((r) => r.index !== rowIndex)
    .map((r, i) => ({ ...r, index: i }));
  return { ...sheet, rows: newRows };
}

export function setCellValue(
  sheet: Sheet,
  rowIndex: number,
  cellKey: string,
  value: unknown
): Sheet {
  const row = getRowByIndex(sheet, rowIndex);
  if (!row) return sheet;
  const cellIndex = row.cells.findIndex((c) => c.key === cellKey);
  if (cellIndex < 0) return sheet;
  const newCell: ValidatedCell = { ...row.cells[cellIndex]!, value, errors: [] };
  const newCells: ValidatedCell[] = row.cells.map((c, i) => (i === cellIndex ? newCell : c));
  const newRow: ValidatedRow = { ...row, cells: newCells, errors: [] };
  const newRows: ValidatedRow[] = sheet.rows.map((r) => (r.index === rowIndex ? newRow : r));
  return { ...sheet, rows: newRows };
}
