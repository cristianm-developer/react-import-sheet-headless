import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { ConvertedSheet } from '../../convert/types/converted-sheet.js';
import { resolveSanitizerRef } from './resolve-sanitizer-ref.js';

export type SheetSanitizerFn = (
  sheet: ConvertedSheet,
  params?: Readonly<Record<string, unknown>>,
) => ConvertedSheet;

export type GetSheetSanitizer = (name: string) => SheetSanitizerFn | undefined;

export function runSheetSanitizers(
  sheet: ConvertedSheet,
  sheetLayout: SheetLayout,
  getSanitizer: GetSheetSanitizer,
): ConvertedSheet {
  const list = sheetLayout.sheetSanitizers;
  if (!list?.length) return sheet;
  let current = sheet;
  for (const ref of list) {
    const { name, params } = resolveSanitizerRef(ref);
    const fn = getSanitizer(name);
    if (fn) current = fn(current, params);
  }
  return current;
}
