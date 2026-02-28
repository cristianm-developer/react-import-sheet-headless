import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_ADD_TRANSFORM_ID = 'numberAdd';

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

export function cellNumberAddTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { value: add = 0 } = (params ?? {}) as Params;
  const delta = Number(add);
  return Number.isNaN(delta) ? value : n + delta;
}

export function registerNumberAddTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_ADD_TRANSFORM_ID, cellNumberAddTransform, { type: 'cell' });
}

export const CellNumberAddTransform = {
  id: NUMBER_ADD_TRANSFORM_ID,
  transform: cellNumberAddTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberAddTransform(registerFn);
    return NUMBER_ADD_TRANSFORM_ID;
  },
};
