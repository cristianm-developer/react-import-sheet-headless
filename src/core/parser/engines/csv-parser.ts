import Papa from 'papaparse';
import type { ParseOptions } from '../types/index.js';
import { toRawSheetCellValue } from './normalize-cell.js';
import { RawParseResult, RawSheetRow, RawSheetCell, RawSheet } from '../../../types/raw-sheet.js';

const DEFAULT_ENCODING = 'UTF-8';

async function blobToText(blob: Blob, encodingOverride?: string): Promise<string> {
  if (encodingOverride && encodingOverride.toUpperCase() !== 'UTF-8') {
    const buffer = await blob.arrayBuffer();
    return new TextDecoder(encodingOverride).decode(buffer);
  }
  return blob.text();
}

export async function parseCsv(
  blob: Blob,
  filesize: number,
  documentHash: string,
  sheetName: string,
  options: ParseOptions = {},
): Promise<RawParseResult> {
  const text = await blobToText(blob, options.encodingOverride);
  const encoding = options.encodingOverride ?? DEFAULT_ENCODING;

  const parseConfig: Papa.ParseConfig<Record<string, unknown>> = {
    header: true,
    delimiter: options.delimiterOverride,
    delimitersToGuess: [',', ';'],
    preview: options.maxRows ?? undefined,
  };
  const result = Papa.parse<Record<string, unknown>>(text, parseConfig);
  const delimiter = result.meta.delimiter ?? options.delimiterOverride ?? ',';

  const headers = result.meta.fields ?? (result.data[0] ? Object.keys(result.data[0] as object) : []);
  const rows: RawSheetRow[] = (result.data ?? []).map((rowObj, i) => {
    const cells: RawSheetCell[] = headers.map((key) => ({
      key,
      value: toRawSheetCellValue((rowObj as Record<string, unknown>)?.[key]),
    }));
    return { index: i, cells };
  });

  const sheet: RawSheet = {
    name: sheetName,
    filesize,
    documentHash,
    headersCount: headers.length,
    rowsCount: result.data?.length ?? 0,
    headers,
    rows,
  };

  return {
    sheets: { [sheetName]: sheet },
    parserMeta: { encoding, delimiter },
  };
}
