import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import type { ConvertedSheet, ConvertedSheetCell, ConvertedSheetRow } from './types/converted-sheet.js';

export function buildConvertedSheet(
  rawSheet: RawSheet,
  _sheetLayout: SheetLayout,
  columnOrder: readonly string[],
  fieldToHeader: Readonly<Record<string, string | null>>,
): ConvertedSheet {
  const headers = [...columnOrder];
  const headerIndex = new Map<string, number>();
  rawSheet.headers.forEach((h, i) => headerIndex.set(h, i));

  const rows: ConvertedSheetRow[] = rawSheet.rows.map((row) => {
    const cells: ConvertedSheetCell[] = columnOrder.map((fieldName) => {
      const fileHeader = fieldToHeader[fieldName];
      const value =
        fileHeader != null
          ? (() => {
              const idx = headerIndex.get(fileHeader);
              if (idx == null) return null;
              const cell = row.cells[idx];
              return cell?.value ?? null;
            })()
          : null;
      return { key: fieldName, value: value ?? null };
    });
    return { index: row.index, cells };
  });

  return {
    name: rawSheet.name,
    filesize: rawSheet.filesize,
    documentHash: rawSheet.documentHash,
    rowsCount: rawSheet.rowsCount,
    headersCount: rawSheet.headersCount,
    headers,
    rows,
  };
}
