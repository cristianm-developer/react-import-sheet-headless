import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_MULTIPLY_TRANSFORM_ID = 'numberMultiply';

type Params = { value?: number };

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

export function cellNumberMultiplyTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { value: factor = 1 } = (params ?? {}) as Params;
  const f = Number(factor);
  return Number.isNaN(f) ? value : n * f;
}

export function registerNumberMultiplyTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_MULTIPLY_TRANSFORM_ID, cellNumberMultiplyTransform, { type: 'cell' });
}

export const CellNumberMultiplyTransform = {
  id: NUMBER_MULTIPLY_TRANSFORM_ID,
  transform: cellNumberMultiplyTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberMultiplyTransform(registerFn);
    return NUMBER_MULTIPLY_TRANSFORM_ID;
  },
};
