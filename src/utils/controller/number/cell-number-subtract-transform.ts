import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_SUBTRACT_TRANSFORM_ID = 'numberSubtract';

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

export function cellNumberSubtractTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { value: sub = 0 } = (params ?? {}) as Params;
  const delta = Number(sub);
  return Number.isNaN(delta) ? value : n - delta;
}

export function registerNumberSubtractTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_SUBTRACT_TRANSFORM_ID, cellNumberSubtractTransform, { type: 'cell' });
}

export const CellNumberSubtractTransform = {
  id: NUMBER_SUBTRACT_TRANSFORM_ID,
  transform: cellNumberSubtractTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberSubtractTransform(registerFn);
    return NUMBER_SUBTRACT_TRANSFORM_ID;
  },
};
