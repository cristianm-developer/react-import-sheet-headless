import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_MIN_VALIDATOR_ID = 'date:min';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { min?: string | number };

function toTime(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  const ms = Date.parse(String(value).trim());
  return Number.isNaN(ms) ? null : ms;
}

export function cellDateMinValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { min } = (params ?? {}) as Params;
  const minMs = min !== undefined ? toTime(min) : undefined;
  if (minMs === undefined || minMs === null) {
    return [{ code: 'DATE_MIN_INVALID_PARAMS', level: 'error', params: { min } }];
  }
  const v = toTime(value);
  if (v === null) return [{ code: 'DATE_MIN_NOT_A_DATE', level: 'error', params: { value } }];
  if (v < minMs) return [{ code: 'DATE_MIN', level: 'error', params: { value: v, min: minMs } }];
  return null;
}

export function registerDateMinValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_MIN_VALIDATOR_ID, cellDateMinValidator, { type: 'cell' });
}

export const CellDateMinValidator = {
  id: DATE_MIN_VALIDATOR_ID,
  validate: cellDateMinValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateMinValidator(registerFn);
    return DATE_MIN_VALIDATOR_ID;
  },
};
