import type { SheetLayoutField } from '../../../types/sheet-layout.js';
import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';
import { resolveTransformRef } from './resolve-transform-ref.js';

export type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>,
) => unknown;

export type GetCellTransform = (name: string) => CellTransformFn | undefined;

export function runCellTransforms(
  cell: ValidatedCell,
  row: ValidatedRow,
  field: SheetLayoutField,
  getTransform: GetCellTransform,
): unknown {
  if (cell.errors.length > 0) return cell.value;
  const list = field.transformations;
  if (!list?.length) return cell.value;
  let current: unknown = cell.value;
  for (const ref of list) {
    const { name, params } = resolveTransformRef(ref);
    const fn = getTransform(name);
    if (fn) current = fn(current, cell, row, params);
  }
  return current;
}
