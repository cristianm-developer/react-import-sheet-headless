import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const DATE_ADD_TRANSFORM_ID = 'dateAdd';

type Params = {
  days?: number;
  minutes?: number;
  hours?: number;
  seconds?: number;
  ms?: number;
  months?: number;
  years?: number;
};

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function addToDate(d: Date, p: Params): Date {
  const out = new Date(d.getTime());
  const ms = Number(p.ms) || 0;
  const sec = Number(p.seconds) || 0;
  const min = Number(p.minutes) || 0;
  const h = Number(p.hours) || 0;
  const days = Number(p.days) || 0;
  out.setTime(out.getTime() + ms + sec * 1000 + min * 60_000 + h * 3_600_000 + days * 86_400_000);
  const months = Number(p.months) || 0;
  const years = Number(p.years) || 0;
  if (months || years) {
    out.setFullYear(out.getFullYear() + years);
    out.setMonth(out.getMonth() + months);
  }
  return out;
}

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellDateAddTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const d = parseToDate(value);
  if (!d) return value;
  return addToDate(d, (params ?? {}) as Params).toISOString();
}

export function registerDateAddTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(DATE_ADD_TRANSFORM_ID, cellDateAddTransform, { type: 'cell' });
}

export const CellDateAddTransform = {
  id: DATE_ADD_TRANSFORM_ID,
  transform: cellDateAddTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateAddTransform(registerFn);
    return DATE_ADD_TRANSFORM_ID;
  },
};
