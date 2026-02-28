import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';

export const NUMBER_ROUND_TRANSFORM_ID = 'numberRound';

type Params = { mode?: 'round' | 'ceil' | 'floor' };

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

export function cellNumberRoundTransform(
  value: unknown,
  _cell: ValidatedCell,
  _row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>
): unknown {
  const n = toNumber(value);
  if (n === null) return value;
  const { mode = 'round' } = (params ?? {}) as Params;
  if (mode === 'ceil') return Math.ceil(n);
  if (mode === 'floor') return Math.floor(n);
  return Math.round(n);
}

export function registerNumberRoundTransform(
  register: (name: string, fn: CellTransformFn, options: { type: 'cell' }) => void
): void {
  register(NUMBER_ROUND_TRANSFORM_ID, cellNumberRoundTransform, { type: 'cell' });
}

export const CellNumberRoundTransform = {
  id: NUMBER_ROUND_TRANSFORM_ID,
  transform: cellNumberRoundTransform,
  Register(
    registerFn?: (name: string, fn: CellTransformFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerNumberRoundTransform(registerFn);
    return NUMBER_ROUND_TRANSFORM_ID;
  },
};
