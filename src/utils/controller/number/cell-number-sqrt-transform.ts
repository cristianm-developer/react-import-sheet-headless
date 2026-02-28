import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_SQRT_TRANSFORM_ID = 'numberSqrt';

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

export function cellNumberSqrtTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null || n < 0) return value;
  return Math.sqrt(n);
}

export function registerNumberSqrtTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_SQRT_TRANSFORM_ID, cellNumberSqrtTransform, { type: 'cell' });
}

export const CellNumberSqrtTransform = {
  id: NUMBER_SQRT_TRANSFORM_ID,
  transform: cellNumberSqrtTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberSqrtTransform(registerFn);
    return NUMBER_SQRT_TRANSFORM_ID;
  },
};
