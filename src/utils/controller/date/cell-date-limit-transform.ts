import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const DATE_LIMIT_TRANSFORM_ID = 'dateLimit';

type Params = { min?: string | number; max?: string | number };

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  if (!Number.isNaN(ms)) return new Date(ms);
  const n = Number(value);
  return Number.isFinite(n) ? new Date(n) : null;
}

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellDateLimitTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const d = parseToDate(value);
  if (!d) return value;
  const { min, max } = (params ?? {}) as Params;
  let out = d.getTime();
  if (min !== undefined) {
    const minD = typeof min === 'number' ? new Date(min) : new Date(String(min));
    if (!Number.isNaN(minD.getTime()) && out < minD.getTime()) out = minD.getTime();
  }
  if (max !== undefined) {
    const maxD = typeof max === 'number' ? new Date(max) : new Date(String(max));
    if (!Number.isNaN(maxD.getTime()) && out > maxD.getTime()) out = maxD.getTime();
  }
  return new Date(out).toISOString();
}

export function registerDateLimitTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(DATE_LIMIT_TRANSFORM_ID, cellDateLimitTransform, { type: 'cell' });
}

export const CellDateLimitTransform = {
  id: DATE_LIMIT_TRANSFORM_ID,
  transform: cellDateLimitTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerDateLimitTransform(registerFn);
    return DATE_LIMIT_TRANSFORM_ID;
  },
};
