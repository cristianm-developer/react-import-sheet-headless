import type { SheetError } from '../../../types/error.js';

export interface ValidatorErrorCell {
  readonly rowIndex: number;
  readonly cellKey: string;
  readonly error: SheetError;
}

export interface ValidatorErrorRow {
  readonly rowIndex: number;
  readonly error: SheetError;
}

export interface ValidatorErrorSheet {
  readonly error: SheetError;
}

export type ValidatorErrorDeltaItem =
  | ValidatorErrorCell
  | ValidatorErrorRow
  | ValidatorErrorSheet;

export interface ValidatorDelta {
  readonly errors: readonly ValidatorErrorDeltaItem[];
}

function isCellError(item: ValidatorErrorDeltaItem): item is ValidatorErrorCell {
  return 'cellKey' in item && 'rowIndex' in item;
}

function isRowError(item: ValidatorErrorDeltaItem): item is ValidatorErrorRow {
  return 'rowIndex' in item && !('cellKey' in item);
}

export function isValidatorErrorCell(
  item: ValidatorErrorDeltaItem,
): item is ValidatorErrorCell {
  return isCellError(item);
}

export function isValidatorErrorRow(
  item: ValidatorErrorDeltaItem,
): item is ValidatorErrorRow {
  return isRowError(item);
}

export function isValidatorErrorSheet(
  item: ValidatorErrorDeltaItem,
): item is ValidatorErrorSheet {
  return !('rowIndex' in item) && !('cellKey' in item);
}
