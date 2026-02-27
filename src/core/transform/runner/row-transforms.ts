import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { ValidatedRow } from '../../../types/sheet.js';
import { resolveTransformRef } from './resolve-transform-ref.js';

export type RowTransformFn = (
  row: ValidatedRow,
  params?: Readonly<Record<string, unknown>>,
) => ValidatedRow;

export type GetRowTransform = (name: string) => RowTransformFn | undefined;

export function runRowTransforms(
  row: ValidatedRow,
  sheetLayout: SheetLayout,
  getTransform: GetRowTransform,
): ValidatedRow {
  if (row.errors.length > 0) return row;
  const list = sheetLayout.rowTransformations;
  if (!list?.length) return row;
  let current: ValidatedRow = row;
  for (const ref of list) {
    const { name, params } = resolveTransformRef(ref);
    const fn = getTransform(name);
    if (fn) current = fn(current, params);
  }
  return current;
}
