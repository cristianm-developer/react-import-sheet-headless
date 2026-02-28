import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const EXTRACT_BY_REGEX_TRANSFORM_ID = 'extractByRegex';

type Params = { pattern?: string; flags?: string; group?: number };

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
) => unknown;

export function cellStringExtractByRegexTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const s =
    typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);
  const { pattern = '', flags = '', group = 0 } = (params ?? {}) as Params;
  if (!pattern) return s;
  try {
    const re = new RegExp(pattern, flags);
    const m = s.match(re);
    if (!m) return '';
    const g = Math.max(0, Number(group) || 0);
    return m[g] ?? m[0] ?? '';
  } catch {
    return s;
  }
}

export function registerStringExtractByRegexTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(EXTRACT_BY_REGEX_TRANSFORM_ID, cellStringExtractByRegexTransform, { type: 'cell' });
}

export const CellStringExtractByRegexTransform = {
  id: EXTRACT_BY_REGEX_TRANSFORM_ID,
  transform: cellStringExtractByRegexTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringExtractByRegexTransform(registerFn);
    return EXTRACT_BY_REGEX_TRANSFORM_ID;
  },
};
