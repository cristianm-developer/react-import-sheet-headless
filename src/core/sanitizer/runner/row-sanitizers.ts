import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { ConvertedSheetRow } from '../../convert/types/converted-sheet.js';
import { resolveSanitizerRef } from './resolve-sanitizer-ref.js';

export type RowSanitizerFn = (
  row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>,
) => ConvertedSheetRow | null;

export type GetRowSanitizer = (name: string) => RowSanitizerFn | undefined;

export function runRowSanitizers(
  row: ConvertedSheetRow,
  sheetLayout: SheetLayout,
  getSanitizer: GetRowSanitizer,
): ConvertedSheetRow | null {
  const list = sheetLayout.rowSanitizers;
  if (!list?.length) return row;
  let current: ConvertedSheetRow | null = row;
  for (const ref of list) {
    if (current === null) break;
    const { name, params } = resolveSanitizerRef(ref);
    const fn = getSanitizer(name);
    if (fn) current = fn(current, params);
  }
  return current;
}
