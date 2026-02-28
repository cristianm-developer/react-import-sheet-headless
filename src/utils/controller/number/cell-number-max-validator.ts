import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const NUMBER_MAX_VALIDATOR_ID = 'number:max';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { max?: number };

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function cellNumberMaxValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { max } = (params ?? {}) as Params;
  const maxVal = typeof max === 'number' && Number.isFinite(max) ? max : undefined;
  if (maxVal === undefined) {
    return [{ code: 'NUMBER_MAX_INVALID_PARAMS', level: 'error', params: { max } }];
  }
  const n = toNumber(value);
  if (n === null) return [{ code: 'NUMBER_MAX_NOT_A_NUMBER', level: 'error', params: { value } }];
  if (n > maxVal) {
    return [{ code: 'NUMBER_MAX', level: 'error', params: { value: n, max: maxVal } }];
  }
  return null;
}

export function registerNumberMaxValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_MAX_VALIDATOR_ID, cellNumberMaxValidator, { type: 'cell' });
}

export const CellNumberMaxValidator = {
  id: NUMBER_MAX_VALIDATOR_ID,
  validate: cellNumberMaxValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberMaxValidator(registerFn);
    return NUMBER_MAX_VALIDATOR_ID;
  },
};
