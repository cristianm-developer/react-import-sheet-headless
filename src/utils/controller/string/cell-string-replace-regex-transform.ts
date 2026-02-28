import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const REPLACE_BY_REGEX_TRANSFORM_ID = 'replaceByRegex';

type Params = { pattern?: string; flags?: string; replacement?: string };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringReplaceByRegexTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  if (typeof value !== 'string') return value;
  const { pattern = '', flags = 'g', replacement = '' } = (params ?? {}) as Params;
  if (!pattern) return value;
  try {
    const re = new RegExp(pattern, flags);
    return value.replace(re, String(replacement));
  } catch {
    return value;
  }
}

export function registerStringReplaceByRegexTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(REPLACE_BY_REGEX_TRANSFORM_ID, cellStringReplaceByRegexTransform, { type: 'cell' });
}

export const CellStringReplaceByRegexTransform = {
  id: REPLACE_BY_REGEX_TRANSFORM_ID,
  transform: cellStringReplaceByRegexTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringReplaceByRegexTransform(registerFn);
    return REPLACE_BY_REGEX_TRANSFORM_ID;
  },
};
