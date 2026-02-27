import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import type { ColumnMismatch } from './types/column-mismatch.js';
import type { ConvertOptions } from './types/convert-options.js';

export interface MatchHeadersResult {
  readonly fieldToHeader: Readonly<Record<string, string | null>>;
  readonly mismatches: readonly ColumnMismatch[];
}

function defaultNormalize(header: string, caseSensitive: boolean): string {
  const trimmed = header.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

export function matchHeadersToLayout(
  rawSheet: RawSheet,
  sheetLayout: SheetLayout,
  headerToFieldMap: Readonly<Record<string, string>> = {},
  options: ConvertOptions = {},
): MatchHeadersResult {
  const caseSensitive = options.caseSensitive ?? false;
  const normalizer = options.normalizer ?? ((h: string) => defaultNormalize(h, caseSensitive));
  const layoutFieldNames = Object.keys(sheetLayout.fields) as string[];
  const fileHeaders = rawSheet.headers as string[];
  const normalizedToFileHeader = new Map<string, string>();
  for (const h of fileHeaders) {
    normalizedToFileHeader.set(normalizer(h), h);
  }

  const fieldToHeader: Record<string, string | null> = {};
  const usedFileHeaders = new Set<string>();

  for (const [fileHeader, fieldName] of Object.entries(headerToFieldMap)) {
    if (layoutFieldNames.includes(fieldName)) {
      fieldToHeader[fieldName] = fileHeaders.includes(fileHeader) ? fileHeader : null;
      if (fieldToHeader[fieldName]) usedFileHeaders.add(fileHeader);
    }
  }

  for (const fieldName of layoutFieldNames) {
    if (fieldToHeader[fieldName] != null) continue;
    const key = normalizer(fieldName);
    const fileHeader = normalizedToFileHeader.get(key);
    if (fileHeader != null && !usedFileHeaders.has(fileHeader)) {
      fieldToHeader[fieldName] = fileHeader;
      usedFileHeaders.add(fileHeader);
    } else {
      fieldToHeader[fieldName] = null;
    }
  }

  const mismatches: ColumnMismatch[] = [];
  for (const fieldName of layoutFieldNames) {
    const found = fieldToHeader[fieldName];
    if (found == null) {
      mismatches.push({
        expected: fieldName,
        found: null,
        message: `Column '${fieldName}' not found in file`,
      });
    }
  }

  return { fieldToHeader, mismatches };
}
