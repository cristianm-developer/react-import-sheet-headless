import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const FILL_END_TRANSFORM_ID = 'fillEnd';

type Params = { length?: number; fill?: string };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringFillEndTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const s =
    typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);
  const { length = 0, fill = ' ' } = (params ?? {}) as Params;
  const safeLength = Math.max(0, Number(length) || 0);
  return safeLength > 0 ? s.padEnd(safeLength, String(fill)) : s;
}

export function registerStringFillEndTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(FILL_END_TRANSFORM_ID, cellStringFillEndTransform, { type: 'cell' });
}

export const CellStringFillEndTransform = {
  id: FILL_END_TRANSFORM_ID,
  transform: cellStringFillEndTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringFillEndTransform(registerFn);
    return FILL_END_TRANSFORM_ID;
  },
};
