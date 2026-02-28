import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const SLICE_TRANSFORM_ID = 'slice';

type Params = { start?: number; end?: number };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringSliceTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  if (typeof value !== 'string') return value;
  const { start, end } = (params ?? {}) as Params;
  const s = Number(start);
  const e = Number(end);
  if (Number.isNaN(s) && Number.isNaN(e)) return value;
  if (Number.isNaN(e)) return value.slice(Number.isNaN(s) ? undefined : s);
  return value.slice(Number.isNaN(s) ? undefined : s, e);
}

export function registerStringSliceTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(SLICE_TRANSFORM_ID, cellStringSliceTransform, { type: 'cell' });
}

export const CellStringSliceTransform = {
  id: SLICE_TRANSFORM_ID,
  transform: cellStringSliceTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringSliceTransform(registerFn);
    return SLICE_TRANSFORM_ID;
  },
};
