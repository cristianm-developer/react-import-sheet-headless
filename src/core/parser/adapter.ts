import type { RawParseResult } from '../../types/raw-sheet.js';
import type { ParseOptions } from './types/index.js';
import { streamHashHex } from './hash.js';
import { parseXlsx } from './engines/xlsx-parser.js';

const XLSX_MIMES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
];
const CSV_MIME = 'text/csv';

function getExtension(blob: Blob, options: ParseOptions): string | null {
  const name = options.fileName ?? (blob as File & { name?: string }).name;
  if (name) {
    const match = name.match(/\.([a-z0-9]+)$/i);
    if (match) return match[1].toLowerCase();
  }
  const type = blob.type?.toLowerCase();
  if (type === CSV_MIME) return 'csv';
  if (XLSX_MIMES.some((m) => type?.startsWith(m) || type === m)) return type.includes('spreadsheetml') ? 'xlsx' : 'xls';
  return null;
}

function isCsv(ext: string | null, blob: Blob): boolean {
  return ext === 'csv' || blob.type === CSV_MIME;
}

function isXlsx(ext: string | null, blob: Blob): boolean {
  if (ext === 'xlsx' || ext === 'xls' || ext === 'ods') return true;
  return XLSX_MIMES.some((m) => blob.type === m || blob.type?.startsWith(m));
}

export async function parseSheet(blob: Blob, options: ParseOptions = {}): Promise<RawParseResult> {
  const filesize = blob.size;
  const documentHash = await streamHashHex(blob);
  const engine = options.engine === 'auto' || options.engine === null || options.engine === undefined ? null : options.engine;
  const ext = getExtension(blob, options);

  if (engine === 'csv' || (engine === null && isCsv(ext, blob))) {
    const { parseCsv } = await import('./engines/csv-parser.js');
    const sheetName = options.fileName ?? (blob as File & { name?: string }).name ?? 'Sheet1';
    return parseCsv(blob, filesize, documentHash, sheetName, options);
  }

  if (engine === 'xlsx' || (engine === null && isXlsx(ext, blob))) {
    const buffer = await blob.arrayBuffer();
    return parseXlsx(buffer, filesize, documentHash, undefined, options);
  }

  if (engine !== null) {
    throw new Error(`Unsupported engine: ${engine}. Use 'xlsx', 'csv', or omit for automatic detection.`);
  }

  throw new Error(`Unsupported file type: ${ext ?? blob.type ?? 'unknown'}. Use .xlsx, .xls, .ods or .csv.`);
}
