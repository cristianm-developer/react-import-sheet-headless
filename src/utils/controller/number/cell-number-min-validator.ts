import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const NUMBER_MIN_VALIDATOR_ID = 'number:min';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { min?: number };

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function cellNumberMinValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { min } = (params ?? {}) as Params;
  const minVal = typeof min === 'number' && Number.isFinite(min) ? min : undefined;
  if (minVal === undefined) {
    return [{ code: 'NUMBER_MIN_INVALID_PARAMS', level: 'error', params: { min } }];
  }
  const n = toNumber(value);
  if (n === null) return [{ code: 'NUMBER_MIN_NOT_A_NUMBER', level: 'error', params: { value } }];
  if (n < minVal) {
    return [{ code: 'NUMBER_MIN', level: 'error', params: { value: n, min: minVal } }];
  }
  return null;
}

export function registerNumberMinValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_MIN_VALIDATOR_ID, cellNumberMinValidator, { type: 'cell' });
}

export const CellNumberMinValidator = {
  id: NUMBER_MIN_VALIDATOR_ID,
  validate: cellNumberMinValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberMinValidator(registerFn);
    return NUMBER_MIN_VALIDATOR_ID;
  },
};
