import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_MAX_VALIDATOR_ID = 'date:max';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { max?: string | number };

function toTime(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  const ms = Date.parse(String(value).trim());
  return Number.isNaN(ms) ? null : ms;
}

export function cellDateMaxValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { max } = (params ?? {}) as Params;
  const maxMs = max !== undefined ? toTime(max) : undefined;
  if (maxMs === undefined || maxMs === null) {
    return [{ code: 'DATE_MAX_INVALID_PARAMS', level: 'error', params: { max } }];
  }
  const v = toTime(value);
  if (v === null) return [{ code: 'DATE_MAX_NOT_A_DATE', level: 'error', params: { value } }];
  if (v > maxMs) return [{ code: 'DATE_MAX', level: 'error', params: { value: v, max: maxMs } }];
  return null;
}

export function registerDateMaxValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_MAX_VALIDATOR_ID, cellDateMaxValidator, { type: 'cell' });
}

export const CellDateMaxValidator = {
  id: DATE_MAX_VALIDATOR_ID,
  validate: cellDateMaxValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateMaxValidator(registerFn);
    return DATE_MAX_VALIDATOR_ID;
  },
};
