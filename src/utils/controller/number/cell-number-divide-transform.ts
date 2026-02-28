import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_DIVIDE_TRANSFORM_ID = 'numberDivide';

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

export function cellNumberDivideTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { value: divisor = 1 } = (params ?? {}) as Params;
  const d = Number(divisor);
  if (Number.isNaN(d) || d === 0) return value;
  return n / d;
}

export function registerNumberDivideTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_DIVIDE_TRANSFORM_ID, cellNumberDivideTransform, { type: 'cell' });
}

export const CellNumberDivideTransform = {
  id: NUMBER_DIVIDE_TRANSFORM_ID,
  transform: cellNumberDivideTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberDivideTransform(registerFn);
    return NUMBER_DIVIDE_TRANSFORM_ID;
  },
};
