import type { Sheet, ValidatedRow } from '../../types/sheet.js';

export function getRowsWithErrors(sheet: Sheet): ValidatedRow[] {
  return sheet.rows.filter((row) => row.errors.length > 0);
}
