import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_PERCENT_TRANSFORM_ID = 'numberPercent';

type Params = { total?: number };

function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellNumberPercentTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { total } = (params ?? {}) as Params;
  const t = Number(total);
  if (Number.isNaN(t) || t === 0) return value;
  return (n / t) * 100;
}

export function registerNumberPercentTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_PERCENT_TRANSFORM_ID, cellNumberPercentTransform, { type: 'cell' });
}

export const CellNumberPercentTransform = {
  id: NUMBER_PERCENT_TRANSFORM_ID,
  transform: cellNumberPercentTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberPercentTransform(registerFn);
    return NUMBER_PERCENT_TRANSFORM_ID;
  },
};
