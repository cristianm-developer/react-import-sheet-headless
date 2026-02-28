import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const DATE_TO_ONLY_TIME_TRANSFORM_ID = 'dateToOnlyTime';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function toISOTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
}

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellDateToOnlyTimeTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  const d = parseToDate(value);
  if (!d) return value;
  return toISOTimeString(d);
}

export function registerDateToOnlyTimeTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(DATE_TO_ONLY_TIME_TRANSFORM_ID, cellDateToOnlyTimeTransform, { type: 'cell' });
}

export const CellDateToOnlyTimeTransform = {
  id: DATE_TO_ONLY_TIME_TRANSFORM_ID,
  transform: cellDateToOnlyTimeTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateToOnlyTimeTransform(registerFn);
    return DATE_TO_ONLY_TIME_TRANSFORM_ID;
  },
};
