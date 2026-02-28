import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const BOOL_ONLY_FALSE_VALIDATOR_ID = 'bool:onlyFalse';

function isFalse(value: unknown): boolean {
  if (value === false) return true;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    return t === 'false' || t === '0' || t === 'no';
  }
  return value === 0;
}

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellBoolOnlyFalseValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined || value === '') return null;
  if (!isFalse(value)) {
    return [{ code: 'BOOL_ONLY_FALSE', level: 'error', params: { value } }];
  }
  return null;
}

export function registerBoolOnlyFalseValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(BOOL_ONLY_FALSE_VALIDATOR_ID, cellBoolOnlyFalseValidator, { type: 'cell' });
}

export const CellBoolOnlyFalseValidator = {
  id: BOOL_ONLY_FALSE_VALIDATOR_ID,
  validate: cellBoolOnlyFalseValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerBoolOnlyFalseValidator(registerFn);
    return BOOL_ONLY_FALSE_VALIDATOR_ID;
  },
};
