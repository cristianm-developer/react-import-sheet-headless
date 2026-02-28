import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_ABS_TRANSFORM_ID = 'numberAbs';

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

export function cellNumberAbsTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  return Math.abs(n);
}

export function registerNumberAbsTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_ABS_TRANSFORM_ID, cellNumberAbsTransform, { type: 'cell' });
}

export const CellNumberAbsTransform = {
  id: NUMBER_ABS_TRANSFORM_ID,
  transform: cellNumberAbsTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberAbsTransform(registerFn);
    return NUMBER_ABS_TRANSFORM_ID;
  },
};
