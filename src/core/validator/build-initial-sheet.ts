import type { SheetLayoutRef } from '../../types/sheet-layout.js';
import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';
import type { SheetError } from '../../types/error.js';
import type { SanitizedSheet } from '../sanitizer/types/sanitized-sheet.js';

export function buildInitialSheet(
  sanitizedSheet: SanitizedSheet,
  sheetLayoutRef: SheetLayoutRef,
): Sheet {
  const rows: ValidatedRow[] = sanitizedSheet.rows.map((row) => {
    const cells: ValidatedCell[] = row.cells.map((cell) => ({
      key: cell.key,
      value: cell.value,
      errors: [] as readonly SheetError[],
    }));
    return {
      index: row.index,
      errors: [],
      cells,
    };
  });
  return {
    ...sanitizedSheet,
    rows,
    rowsCount: rows.length,
    sheetLayout: sheetLayoutRef,
    errors: [],
  };
}
