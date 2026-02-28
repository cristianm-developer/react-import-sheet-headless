import type { Sheet } from '../../types/sheet.js';
import type { ViewCounts } from './types/index.js';
import { getRowsWithErrors } from './get-rows-with-errors.js';

export function hasValidationErrors(sheet: Sheet | null): boolean {
  if (!sheet) return false;
  return getViewCounts(sheet).totalErrors > 0;
}

export function getViewCounts(sheet: Sheet): ViewCounts {
  const totalRows = sheet.rows.length;
  const rowsWithErrors = getRowsWithErrors(sheet);
  const totalErrors =
    sheet.errors.length +
    sheet.rows.reduce(
      (sum, row) =>
        sum + row.errors.length + row.cells.reduce((c, cell) => c + cell.errors.length, 0),
      0
    );
  return {
    totalRows,
    rowsWithErrors: rowsWithErrors.length,
    totalErrors,
  };
}
