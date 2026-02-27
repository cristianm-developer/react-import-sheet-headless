import { Registry } from '../../../shared/registry/index.js';
import { registerToUpperTransform } from '../../../utils/controller/string/cell-to-upper-transform.js';
import type { Sheet } from '../../../types/sheet.js';
import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';
import type { TransformDeltaItem } from '../types/transform-delta.js';
import type { TransformGetters } from '../runner/run-transform.js';

type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  p?: Readonly<Record<string, unknown>>,
) => unknown;

type RowTransformFn = (
  row: ValidatedRow,
  p?: Readonly<Record<string, unknown>>,
) => ValidatedRow;

type SheetTransformFn = (
  sheet: Sheet,
  p?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal,
) => readonly TransformDeltaItem[] | Promise<readonly TransformDeltaItem[]>;

const registry = new Registry<(...args: unknown[]) => unknown>();

registerToUpperTransform((name, fn, opts) => {
  registry.register(name, fn, opts);
});

function getCellTransform(name: string): CellTransformFn | undefined {
  const entry = registry.get(name);
  if (!entry || entry.type !== 'cell') return undefined;
  return entry.fn as CellTransformFn;
}

function getRowTransform(_name: string): RowTransformFn | undefined {
  return undefined;
}

function getSheetTransform(_name: string): SheetTransformFn | undefined {
  return undefined;
}

export function getTransformGetters(): TransformGetters {
  return {
    getCellTransform,
    getRowTransform,
    getSheetTransform,
  };
}
