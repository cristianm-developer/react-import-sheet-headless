import type { SheetLayout } from '../../types/sheet-layout.js';
import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';
import type { SanitizedSheet } from '../sanitizer/types/sanitized-sheet.js';
import { runCellValidators } from '../validator/runner/cell-validators.js';
import { runRowValidators } from '../validator/runner/row-validators.js';
import { runTableValidation } from '../validator/runner/run-table-validation.js';
import { isValidatorErrorSheet } from '../validator/types/validator-delta.js';
import type { GetCellValidator } from '../validator/runner/cell-validators.js';
import type { GetRowValidator } from '../validator/runner/row-validators.js';
import type { GetTableValidator } from '../validator/runner/run-table-validation.js';
import { runCellTransforms } from '../transform/runner/cell-transforms.js';
import { runRowTransforms } from '../transform/runner/row-transforms.js';
import { runSheetTransforms } from '../transform/runner/sheet-transforms.js';
import type { GetCellTransform } from '../transform/runner/cell-transforms.js';
import type { GetRowTransform } from '../transform/runner/row-transforms.js';
import type { GetSheetTransform } from '../transform/runner/sheet-transforms.js';
import { applyTransformDelta } from '../transform/delta-applier.js';
import { setCellValue } from './immutable-update.js';
import { getRowByIndex, getCellByKey } from './resolve.js';

export interface EditValidatorGetters {
  getCellValidator: GetCellValidator;
  getRowValidator: GetRowValidator;
  getTableValidator: GetTableValidator;
}

export interface EditTransformGetters {
  getCellTransform: GetCellTransform;
  getRowTransform: GetRowTransform;
  getSheetTransform: GetSheetTransform;
}

export interface EditPipelineGetters {
  validator: EditValidatorGetters;
  transform: EditTransformGetters;
}

export async function runEditPipeline(
  sheet: Sheet,
  sheetLayout: SheetLayout,
  rowIndex: number,
  cellKey: string,
  value: unknown,
  getters: EditPipelineGetters,
  signal?: AbortSignal,
): Promise<Sheet> {
  const sheet1 = setCellValue(sheet, rowIndex, cellKey, value);
  const row = getRowByIndex(sheet1, rowIndex);
  if (!row) return sheet1;
  const cell = getCellByKey(row, cellKey);
  if (!cell) return sheet1;
  const field = sheetLayout.fields[cellKey];
  if (!field) return sheet1;

  const cellErrors = runCellValidators(
    cell as unknown as import('../sanitizer/types/sanitized-sheet.js').SanitizedSheetCell,
    row as unknown as import('../sanitizer/types/sanitized-sheet.js').SanitizedSheetRow,
    field,
    getters.validator.getCellValidator,
  );
  const newCell: ValidatedCell = { ...cell, errors: cellErrors };
  const newRow: ValidatedRow = {
    ...row,
    cells: row.cells.map((c) => (c.key === cellKey ? newCell : c)),
    errors: [],
  };
  const rowErrors = runRowValidators(
    newRow as unknown as import('../sanitizer/types/sanitized-sheet.js').SanitizedSheetRow,
    sheetLayout,
    getters.validator.getRowValidator,
  );
  const newRow2: ValidatedRow = { ...newRow, errors: rowErrors };
  const newRows = sheet1.rows.map((r) => (r.index === rowIndex ? newRow2 : r));
  const sheet2: Sheet = { ...sheet1, rows: newRows };

  const tableErrors = await runTableValidation(
    sheet2 as unknown as SanitizedSheet,
    sheetLayout,
    getters.validator.getTableValidator,
    signal,
  );
  const sheetErrors = tableErrors
    .filter(isValidatorErrorSheet)
    .map((i) => i.error);
  const sheet3: Sheet = { ...sheet2, errors: [...sheet2.errors, ...sheetErrors] };

  if (sheet3.errors.length > 0) return sheet3;

  const cellValue =
    newCell.errors.length === 0
      ? runCellTransforms(
          newCell,
          newRow2,
          field,
          getters.transform.getCellTransform,
        )
      : newCell.value;
  const updatedCell: ValidatedCell = { ...newCell, value: cellValue };
  const rowWithCellTransform: ValidatedRow = {
    ...newRow2,
    cells: newRow2.cells.map((c) => (c.key === cellKey ? updatedCell : c)),
  };
  const transformedRow =
    newRow2.errors.length === 0
      ? runRowTransforms(
          rowWithCellTransform,
          sheetLayout,
          getters.transform.getRowTransform,
        )
      : rowWithCellTransform;
  const sheet4: Sheet = {
    ...sheet3,
    rows: sheet3.rows.map((r) => (r.index === rowIndex ? transformedRow : r)),
  };
  const sheetOut = await runSheetTransforms(
    sheet4,
    sheetLayout,
    getters.transform.getSheetTransform,
    signal,
  );
  const sheet5 = applyTransformDelta(sheet4, { deltas: sheetOut.deltas });
  if (sheetOut.errors.length > 0) {
    return { ...sheet5, errors: [...sheet5.errors, ...sheetOut.errors] };
  }
  return sheet5;
}
