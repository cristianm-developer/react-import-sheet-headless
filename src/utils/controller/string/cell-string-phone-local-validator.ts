import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_PHONE_LOCAL_VALIDATOR_ID = 'string:phoneLocal';

type Params = { minDigits?: number; maxDigits?: number };

const DEFAULT_MIN = 6;
const DEFAULT_MAX = 11;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringPhoneLocalValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { minDigits = DEFAULT_MIN, maxDigits = DEFAULT_MAX } = (params ?? {}) as Params;
  const min = typeof minDigits === 'number' && minDigits >= 0 ? minDigits : DEFAULT_MIN;
  const max = typeof maxDigits === 'number' && maxDigits >= min ? maxDigits : DEFAULT_MAX;
  const s = value === null || value === undefined ? '' : String(value).trim();
  if (!s) return null;
  const digits = s.replace(/\D/g, '');
  if (s.startsWith('+') && digits.length > 3) {
    return [
      {
        code: 'STRING_PHONE_LOCAL_INVALID',
        level: 'error',
        params: { value: s, reason: 'international' },
      },
    ];
  }
  if (digits.length < min || digits.length > max) {
    return [
      {
        code: 'STRING_PHONE_LOCAL_INVALID',
        level: 'error',
        params: { value: s, minDigits: min, maxDigits: max },
      },
    ];
  }
  return null;
}

export function registerStringPhoneLocalValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_PHONE_LOCAL_VALIDATOR_ID, cellStringPhoneLocalValidator, { type: 'cell' });
}

export const CellStringPhoneLocalValidator = {
  id: STRING_PHONE_LOCAL_VALIDATOR_ID,
  validate: cellStringPhoneLocalValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringPhoneLocalValidator(registerFn);
    return STRING_PHONE_LOCAL_VALIDATOR_ID;
  },
};
