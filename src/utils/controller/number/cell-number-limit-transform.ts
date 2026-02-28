import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_LIMIT_TRANSFORM_ID = 'numberLimit';

type Params = { min?: number; max?: number };

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

export function cellNumberLimitTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { min, max } = (params ?? {}) as Params;
  let out = n;
  const minVal = Number(min);
  if (!Number.isNaN(minVal) && out < minVal) out = minVal;
  const maxVal = Number(max);
  if (!Number.isNaN(maxVal) && out > maxVal) out = maxVal;
  return out;
}

export function registerNumberLimitTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_LIMIT_TRANSFORM_ID, cellNumberLimitTransform, { type: 'cell' });
}

export const CellNumberLimitTransform = {
  id: NUMBER_LIMIT_TRANSFORM_ID,
  transform: cellNumberLimitTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberLimitTransform(registerFn);
    return NUMBER_LIMIT_TRANSFORM_ID;
  },
};
