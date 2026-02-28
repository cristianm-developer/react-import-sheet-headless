import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_PHONE_VALIDATOR_ID = 'string:phone';

const PHONE_REGEX = /^[\d\s\-+.()]{7,20}$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringPhoneValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const s = value === null || value === undefined ? '' : String(value).trim();
  if (!s) return null;
  const digitsOnly = s.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15 || !PHONE_REGEX.test(s)) {
    return [{ code: 'STRING_PHONE_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerStringPhoneValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_PHONE_VALIDATOR_ID, cellStringPhoneValidator, { type: 'cell' });
}

export const CellStringPhoneValidator = {
  id: STRING_PHONE_VALIDATOR_ID,
  validate: cellStringPhoneValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringPhoneValidator(registerFn);
    return STRING_PHONE_VALIDATOR_ID;
  },
};
