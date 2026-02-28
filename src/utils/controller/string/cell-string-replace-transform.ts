import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const REPLACE_STR_TRANSFORM_ID = 'replace';

type Params = { search?: string; replacement?: string };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringReplaceTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  if (typeof value !== 'string') return value;
  const { search = '', replacement = '' } = (params ?? {}) as Params;
  return value.split(String(search)).join(String(replacement));
}

export function registerStringReplaceTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(REPLACE_STR_TRANSFORM_ID, cellStringReplaceTransform, { type: 'cell' });
}

export const CellStringReplaceTransform = {
  id: REPLACE_STR_TRANSFORM_ID,
  transform: cellStringReplaceTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringReplaceTransform(registerFn);
    return REPLACE_STR_TRANSFORM_ID;
  },
};
