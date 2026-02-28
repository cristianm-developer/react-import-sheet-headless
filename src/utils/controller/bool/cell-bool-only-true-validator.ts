import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const BOOL_ONLY_TRUE_VALIDATOR_ID = 'bool:onlyTrue';

function isTrue(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    return t === 'true' || t === '1' || t === 'yes';
  }
  return value === 1;
}

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellBoolOnlyTrueValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined || value === '') return null;
  if (!isTrue(value)) {
    return [{ code: 'BOOL_ONLY_TRUE', level: 'error', params: { value } }];
  }
  return null;
}

export function registerBoolOnlyTrueValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(BOOL_ONLY_TRUE_VALIDATOR_ID, cellBoolOnlyTrueValidator, { type: 'cell' });
}

export const CellBoolOnlyTrueValidator = {
  id: BOOL_ONLY_TRUE_VALIDATOR_ID,
  validate: cellBoolOnlyTrueValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerBoolOnlyTrueValidator(registerFn);
    return BOOL_ONLY_TRUE_VALIDATOR_ID;
  },
};
