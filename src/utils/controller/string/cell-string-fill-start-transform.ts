import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const FILL_START_TRANSFORM_ID = 'fillStart';

type Params = { length?: number; fill?: string };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringFillStartTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const s =
    typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);
  const { length = 0, fill = ' ' } = (params ?? {}) as Params;
  const safeLength = Math.max(0, Number(length) || 0);
  return safeLength > 0 ? s.padStart(safeLength, String(fill)) : s;
}

export function registerStringFillStartTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(FILL_START_TRANSFORM_ID, cellStringFillStartTransform, { type: 'cell' });
}

export const CellStringFillStartTransform = {
  id: FILL_START_TRANSFORM_ID,
  transform: cellStringFillStartTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringFillStartTransform(registerFn);
    return FILL_START_TRANSFORM_ID;
  },
};
