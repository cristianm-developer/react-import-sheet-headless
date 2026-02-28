import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_EMAIL_VALIDATOR_ID = 'string:email';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringEmailValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const s = value === null || value === undefined ? '' : String(value).trim();
  if (!s) return null;
  if (!EMAIL_REGEX.test(s)) {
    return [{ code: 'STRING_EMAIL_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerStringEmailValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_EMAIL_VALIDATOR_ID, cellStringEmailValidator, { type: 'cell' });
}

export const CellStringEmailValidator = {
  id: STRING_EMAIL_VALIDATOR_ID,
  validate: cellStringEmailValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringEmailValidator(registerFn);
    return STRING_EMAIL_VALIDATOR_ID;
  },
};
