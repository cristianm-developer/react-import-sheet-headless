import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const TO_LOWER_TRANSFORM_ID = 'toLowerCase';

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringToLowerTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  if (typeof value !== 'string') return value;
  return value.toLowerCase();
}

export function registerStringToLowerTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(TO_LOWER_TRANSFORM_ID, cellStringToLowerTransform, { type: 'cell' });
}

export const CellStringToLowerTransform = {
  id: TO_LOWER_TRANSFORM_ID,
  transform: cellStringToLowerTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringToLowerTransform(registerFn);
    return TO_LOWER_TRANSFORM_ID;
  },
};
