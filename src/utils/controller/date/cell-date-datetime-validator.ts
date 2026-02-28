import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const DATE_DATETIME_VALIDATOR_ID = 'date:datetime';

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

export function cellDateDatetimeValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = toTime(value);
  if (ms === null) {
    return [{ code: 'DATE_DATETIME_INVALID', level: 'error', params: { value: s } }];
  }
  return null;
}

export function registerDateDatetimeValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(DATE_DATETIME_VALIDATOR_ID, cellDateDatetimeValidator, { type: 'cell' });
}

export const CellDateDatetimeValidator = {
  id: DATE_DATETIME_VALIDATOR_ID,
  validate: cellDateDatetimeValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateDatetimeValidator(registerFn);
    return DATE_DATETIME_VALIDATOR_ID;
  },
};
