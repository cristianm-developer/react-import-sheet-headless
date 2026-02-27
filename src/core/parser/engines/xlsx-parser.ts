import * as XLSX from 'xlsx';
import type { RawParseResult, RawSheet, RawSheetRow, RawSheetCell } from '../../../../types/raw-sheet.js';
import type { ParseOptions } from '../types/index.js';
import { toRawSheetCellValue } from './normalize-cell.js';

export function parseXlsx(
  arrayBuffer: ArrayBuffer,
  filesize: number,
  documentHash: string,
  sheetNameOverride?: string,
  options: ParseOptions = {},
): RawParseResult {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const maxRows = options.maxRows;
  const sheets: Record<string, RawSheet> = {};

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const rowsArray = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
    if (rowsArray.length === 0) {
      sheets[name] = {
        name: sheetNameOverride ?? name,
        filesize,
        documentHash,
        headersCount: 0,
        headers: [],
        rowsCount: 0,
        rows: [],
      };
      continue;
    }
    const headerRow = rowsArray[0] as unknown[];
    const headers = headerRow.map((h) => (h != null ? String(h) : ''));
    const dataRows = rowsArray.slice(1);
    const rowsToTake = maxRows != null ? Math.min(maxRows, dataRows.length) : dataRows.length;
    const rows: RawSheetRow[] = [];

    for (let i = 0; i < rowsToTake; i++) {
      const rowValues = dataRows[i] as unknown[] | undefined;
      const cells: RawSheetCell[] = headers.map((key, colIndex) => {
        const raw = rowValues?.[colIndex];
        return { key, value: toRawSheetCellValue(raw) };
      });
      rows.push({ index: i, cells });
    }

    sheets[name] = {
      name: sheetNameOverride ?? name,
      filesize,
      documentHash,
      headersCount: headers.length,
      rowsCount: dataRows.length,
      headers,
      rows,
    };
  }

  return { sheets };
}
