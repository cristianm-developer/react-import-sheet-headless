import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_ONLY_YEAR_VALIDATOR_ID = 'date:onlyYear';

const YEAR_REGEX = /^(?:19|20)\d{2}$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellDateOnlyYearValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const n = Number(s);
  const strMatch = YEAR_REGEX.test(s);
  const numMatch = Number.isInteger(n) && n >= 1900 && n <= 2099;
  if (!strMatch && !numMatch) {
    return [{ code: 'DATE_ONLY_YEAR_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerDateOnlyYearValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_ONLY_YEAR_VALIDATOR_ID, cellDateOnlyYearValidator, { type: 'cell' });
}

export const CellDateOnlyYearValidator = {
  id: DATE_ONLY_YEAR_VALIDATOR_ID,
  validate: cellDateOnlyYearValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateOnlyYearValidator(registerFn);
    return DATE_ONLY_YEAR_VALIDATOR_ID;
  },
};
