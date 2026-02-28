import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_ONLY_LETTERS_VALIDATOR_ID = 'string:onlyLetters';

type Params = { allowSpaces?: boolean };

const ONLY_LETTERS = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+$/;
const ONLY_LETTERS_AND_SPACES = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s]+$/;

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellStringOnlyLettersValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { allowSpaces = false } = (params ?? {}) as Params;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const re = allowSpaces ? ONLY_LETTERS_AND_SPACES : ONLY_LETTERS;
  if (!re.test(s)) {
    return [{ code: 'STRING_ONLY_LETTERS_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerStringOnlyLettersValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_ONLY_LETTERS_VALIDATOR_ID, cellStringOnlyLettersValidator, { type: 'cell' });
}

export const CellStringOnlyLettersValidator = {
  id: STRING_ONLY_LETTERS_VALIDATOR_ID,
  validate: cellStringOnlyLettersValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringOnlyLettersValidator(registerFn);
    return STRING_ONLY_LETTERS_VALIDATOR_ID;
  },
};
