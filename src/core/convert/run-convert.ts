import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import { buildConvertedSheet } from './build-converted-sheet.js';
import { matchHeadersToLayout } from './match-headers.js';
import type { ConvertMismatchData } from './types/convert-mismatch-data.js';
import type { ConvertOptions } from './types/convert-options.js';
import type { ConvertSuccess } from './types/convert-success.js';

export type RunConvertExisting = {
  readonly columnOrder: readonly string[];
  readonly headerToFieldMap: Readonly<Record<string, string>>;
};

export type RunConvertResult = ConvertSuccess | ConvertMismatchData;

export function runConvert(
  rawSheet: RawSheet,
  sheetLayout: SheetLayout,
  options: ConvertOptions = {},
  existing?: RunConvertExisting,
): RunConvertResult {
  const layoutFieldNames = Object.keys(sheetLayout.fields) as string[];
  const columnOrder = existing?.columnOrder?.length
    ? (existing.columnOrder as string[])
    : layoutFieldNames;
  const headerToFieldMap = existing?.headerToFieldMap ?? {};

  const { fieldToHeader, mismatches } = matchHeadersToLayout(
    rawSheet,
    sheetLayout,
    headerToFieldMap,
    options,
  );

  const allMatched = mismatches.length === 0;
  if (allMatched) {
    const sheet = buildConvertedSheet(rawSheet, sheetLayout, columnOrder, fieldToHeader);
    return { kind: 'success', sheet };
  }

  return {
    kind: 'mismatch',
    headersFound: [...rawSheet.headers],
    mismatches,
    columnOrder: [...columnOrder],
    headerToFieldMap: { ...headerToFieldMap },
  };
}
