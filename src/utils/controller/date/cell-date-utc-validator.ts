import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_UTC_VALIDATOR_ID = 'date:utc';

function toTime(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  const ms = Date.parse(String(value).trim());
  return Number.isNaN(ms) ? null : ms;
}

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellDateUtcValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = toTime(value);
  if (ms === null) {
    return [{ code: 'DATE_UTC_NOT_A_DATE', level: 'error', params: { value: s } }];
  }
  const isUtc =
    typeof value === 'number' || s.endsWith('Z') || /[+-]00:00$/.test(s) || /^\d+$/.test(s);
  if (!isUtc) {
    return [{ code: 'DATE_UTC_REQUIRED', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerDateUtcValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_UTC_VALIDATOR_ID, cellDateUtcValidator, { type: 'cell' });
}

export const CellDateUtcValidator = {
  id: DATE_UTC_VALIDATOR_ID,
  validate: cellDateUtcValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateUtcValidator(registerFn);
    return DATE_UTC_VALIDATOR_ID;
  },
};
