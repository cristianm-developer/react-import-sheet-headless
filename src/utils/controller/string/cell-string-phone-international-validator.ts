import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_PHONE_INTERNATIONAL_VALIDATOR_ID = 'string:phoneInternational';

const E164_PREFIX = /^\+?[1-9]\d{0,3}/;
const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringPhoneInternationalValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const s = value === null || value === undefined ? '' : String(value).trim().replace(/\s/g, '');
  if (!s) return null;
  const digits = s.replace(/\D/g, '');
  const withPlus = s.startsWith('+') ? s : `+${s}`;
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS || !E164_PREFIX.test(withPlus)) {
    return [{ code: 'STRING_PHONE_INTERNATIONAL_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerStringPhoneInternationalValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_PHONE_INTERNATIONAL_VALIDATOR_ID, cellStringPhoneInternationalValidator, {
    type: 'cell',
  });
}

export const CellStringPhoneInternationalValidator = {
  id: STRING_PHONE_INTERNATIONAL_VALIDATOR_ID,
  validate: cellStringPhoneInternationalValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringPhoneInternationalValidator(registerFn);
    return STRING_PHONE_INTERNATIONAL_VALIDATOR_ID;
  },
};
