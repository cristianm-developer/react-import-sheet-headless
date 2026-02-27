import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const TO_UPPER_TRANSFORM_ID = 'toUpperCase';

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>,
) => unknown;

export function cellToUpperTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  _params?: Readonly<Record<string, unknown>>,
): unknown {
  if (typeof value !== 'string') return value;
  return value.toUpperCase();
}

export function registerToUpperTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void,
): void {
  register(TO_UPPER_TRANSFORM_ID, cellToUpperTransform, { type: 'cell' });
}

export const CellToUpperTransform = {
  id: TO_UPPER_TRANSFORM_ID,
  transform: cellToUpperTransform,
  Register(registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void): string {
    if (registerFn) registerToUpperTransform(registerFn);
    return TO_UPPER_TRANSFORM_ID;
  },
};
