import type { SheetError } from '../../types/error.js';
import type { Sheet, ValidatedCell, ValidatedRow } from '../../types/sheet.js';
import type { ValidatorDelta } from './types/validator-delta.js';
import {
  isValidatorErrorCell,
  isValidatorErrorRow,
  isValidatorErrorSheet,
} from './types/validator-delta.js';

function patchCellError(
  rows: ValidatedRow[],
  rowIndex: number,
  cellKey: string,
  error: SheetError,
): ValidatedRow[] {
  return rows.map((row) => {
    if (row.index !== rowIndex) return row;
    const cells: ValidatedCell[] = row.cells.map((cell) => {
      if (cell.key !== cellKey) return cell;
      const next = [...cell.errors, error];
      return { ...cell, errors: next };
    });
    return { ...row, cells };
  });
}

function patchRowError(
  rows: ValidatedRow[],
  rowIndex: number,
  error: SheetError,
): ValidatedRow[] {
  return rows.map((row) => {
    if (row.index !== rowIndex) return row;
    return { ...row, errors: [...row.errors, error] };
  });
}

export function applyValidatorDelta(sheet: Sheet, delta: ValidatorDelta): Sheet {
  let rows = [...sheet.rows];
  let sheetErrors = [...sheet.errors];

  for (const item of delta.errors) {
    if (isValidatorErrorCell(item)) {
      rows = patchCellError(rows, item.rowIndex, item.cellKey, item.error);
    } else if (isValidatorErrorRow(item)) {
      rows = patchRowError(rows, item.rowIndex, item.error);
    } else if (isValidatorErrorSheet(item)) {
      sheetErrors = [...sheetErrors, item.error];
    }
  }

  return {
    ...sheet,
    rows,
    errors: sheetErrors,
  };
}
