import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const NUMBER_INTEGER_VALIDATOR_ID = 'number:integer';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

function toInteger(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value)) return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Number.isInteger(n) ? n : null;
}

export function cellNumberIntegerValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined || value === '') return null;
  const n = toInteger(value);
  if (n === null) {
    return [{ code: 'NUMBER_INTEGER_INVALID', level: 'error', params: { value } }];
  }
  return null;
}

export function registerNumberIntegerValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_INTEGER_VALIDATOR_ID, cellNumberIntegerValidator, { type: 'cell' });
}

export const CellNumberIntegerValidator = {
  id: NUMBER_INTEGER_VALIDATOR_ID,
  validate: cellNumberIntegerValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberIntegerValidator(registerFn);
    return NUMBER_INTEGER_VALIDATOR_ID;
  },
};
