import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_TIMESTAMP_VALIDATOR_ID = 'date:timestamp';

const MAX_MS = 8640000000000;
const MIN_MS = -8640000000000;

function toTimestamp(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  const s = String(value).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
}

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

export function cellDateTimestampValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = toTimestamp(value);
  if (ms === null) {
    return [{ code: 'DATE_TIMESTAMP_INVALID', level: 'error', params: { value: s } }];
  }
  if (ms < MIN_MS || ms > MAX_MS) {
    return [{ code: 'DATE_TIMESTAMP_OUT_OF_RANGE', level: 'error', params: { value: ms } }];
  }
  return null;
}

export function registerDateTimestampValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_TIMESTAMP_VALIDATOR_ID, cellDateTimestampValidator, { type: 'cell' });
}

export const CellDateTimestampValidator = {
  id: DATE_TIMESTAMP_VALIDATOR_ID,
  validate: cellDateTimestampValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateTimestampValidator(registerFn);
    return DATE_TIMESTAMP_VALIDATOR_ID;
  },
};
