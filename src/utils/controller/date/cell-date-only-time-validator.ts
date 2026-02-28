import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_ONLY_TIME_VALIDATOR_ID = 'date:onlyTime';

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?(?:\.\d+)?$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellDateOnlyTimeValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (!TIME_REGEX.test(s)) {
    return [{ code: 'DATE_ONLY_TIME_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerDateOnlyTimeValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_ONLY_TIME_VALIDATOR_ID, cellDateOnlyTimeValidator, { type: 'cell' });
}

export const CellDateOnlyTimeValidator = {
  id: DATE_ONLY_TIME_VALIDATOR_ID,
  validate: cellDateOnlyTimeValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateOnlyTimeValidator(registerFn);
    return DATE_ONLY_TIME_VALIDATOR_ID;
  },
};
