import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const NUMBER_NON_NEGATIVE_VALIDATOR_ID = 'number:nonNegative';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function cellNumberNonNegativeValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined || value === '') return null;
  const n = toNumber(value);
  if (n === null)
    return [{ code: 'NUMBER_NON_NEGATIVE_NOT_A_NUMBER', level: 'error', params: { value } }];
  if (n < 0) return [{ code: 'NUMBER_NON_NEGATIVE', level: 'error', params: { value: n } }];
  return null;
}

export function registerNumberNonNegativeValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_NON_NEGATIVE_VALIDATOR_ID, cellNumberNonNegativeValidator, { type: 'cell' });
}

export const CellNumberNonNegativeValidator = {
  id: NUMBER_NON_NEGATIVE_VALIDATOR_ID,
  validate: cellNumberNonNegativeValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberNonNegativeValidator(registerFn);
    return NUMBER_NON_NEGATIVE_VALIDATOR_ID;
  },
};
