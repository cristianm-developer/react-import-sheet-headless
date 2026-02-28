import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_ONLY_NUMBERS_VALIDATOR_ID = 'string:onlyNumbers';

const ONLY_DIGITS = /^\d+$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringOnlyNumbersValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (!ONLY_DIGITS.test(s)) {
    return [{ code: 'STRING_ONLY_NUMBERS_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerStringOnlyNumbersValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_ONLY_NUMBERS_VALIDATOR_ID, cellStringOnlyNumbersValidator, { type: 'cell' });
}

export const CellStringOnlyNumbersValidator = {
  id: STRING_ONLY_NUMBERS_VALIDATOR_ID,
  validate: cellStringOnlyNumbersValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringOnlyNumbersValidator(registerFn);
    return STRING_ONLY_NUMBERS_VALIDATOR_ID;
  },
};
