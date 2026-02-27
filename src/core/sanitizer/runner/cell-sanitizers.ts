import type { SheetLayoutField } from '../../../types/sheet-layout.js';
import type { ConvertedSheetCell, ConvertedSheetRow } from '../../convert/types/converted-sheet.js';
import { resolveSanitizerRef } from './resolve-sanitizer-ref.js';

export type CellSanitizerFn = (
  cell: ConvertedSheetCell,
  row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>,
) => ConvertedSheetCell;

export type GetCellSanitizer = (name: string) => CellSanitizerFn | undefined;

export function runCellSanitizers(
  cell: ConvertedSheetCell,
  row: ConvertedSheetRow,
  field: SheetLayoutField,
  getSanitizer: GetCellSanitizer,
): ConvertedSheetCell {
  const list = field.sanitizers;
  if (!list?.length) return cell;
  let current: ConvertedSheetCell = cell;
  for (const ref of list) {
    const { name, params } = resolveSanitizerRef(ref);
    const fn = getSanitizer(name);
    if (fn) current = fn(current, row, params);
  }
  return current;
}
