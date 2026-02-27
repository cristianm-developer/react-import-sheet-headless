import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const REQUIRED_VALIDATOR_ID = 'required';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>,
) => readonly SheetError[] | null;

export function cellRequiredValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>,
): readonly SheetError[] | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '');
  if (isEmpty) {
    return [{ code: 'REQUIRED', level: 'error', params: { value } }];
  }
  return null;
}

export function registerRequiredValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void,
): void {
  register(REQUIRED_VALIDATOR_ID, cellRequiredValidator, { type: 'cell' });
}

export const CellRequiredValidator = {
  id: REQUIRED_VALIDATOR_ID,
  validate: cellRequiredValidator,
  Register(registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void): string {
    if (registerFn) registerRequiredValidator(registerFn);
    return REQUIRED_VALIDATOR_ID;
  },
};
