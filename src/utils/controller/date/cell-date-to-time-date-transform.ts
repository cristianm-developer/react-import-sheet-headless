import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const DATE_TO_TIME_DATE_TRANSFORM_ID = 'dateToTimeDate';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

export function cellDateToTimeDateTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  const d = parseToDate(value);
  if (!d) return value;
  return `${toISODateString(d)}T${toISOTimeString(d)}`;
}

export function registerDateToTimeDateTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(DATE_TO_TIME_DATE_TRANSFORM_ID, cellDateToTimeDateTransform, { type: 'cell' });
}

export const CellDateToTimeDateTransform = {
  id: DATE_TO_TIME_DATE_TRANSFORM_ID,
  transform: cellDateToTimeDateTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateToTimeDateTransform(registerFn);
    return DATE_TO_TIME_DATE_TRANSFORM_ID;
  },
};
