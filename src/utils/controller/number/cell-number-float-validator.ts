import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const NUMBER_FLOAT_VALIDATOR_ID = 'number:float';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

function isFiniteFloat(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  const s = String(value).trim();
  if (!s) return false;
  const n = parseFloat(s);
  return Number.isFinite(n);
}

export function cellNumberFloatValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined || value === '') return null;
  if (!isFiniteFloat(value)) {
    return [{ code: 'NUMBER_FLOAT_INVALID', level: 'error', params: { value } }];
  }
  return null;
}

export function registerNumberFloatValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_FLOAT_VALIDATOR_ID, cellNumberFloatValidator, { type: 'cell' });
}

export const CellNumberFloatValidator = {
  id: NUMBER_FLOAT_VALIDATOR_ID,
  validate: cellNumberFloatValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberFloatValidator(registerFn);
    return NUMBER_FLOAT_VALIDATOR_ID;
  },
};
