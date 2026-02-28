import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const DATE_TO_UTC_TRANSFORM_ID = 'dateToUtc';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellDateToUtcTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  const d = parseToDate(value);
  if (!d) return value;
  return d.toISOString();
}

export function registerDateToUtcTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(DATE_TO_UTC_TRANSFORM_ID, cellDateToUtcTransform, { type: 'cell' });
}

export const CellDateToUtcTransform = {
  id: DATE_TO_UTC_TRANSFORM_ID,
  transform: cellDateToUtcTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateToUtcTransform(registerFn);
    return DATE_TO_UTC_TRANSFORM_ID;
  },
};
