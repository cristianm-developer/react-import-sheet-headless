import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const DATE_ONLY_SANITIZER_ID = 'data:data';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function cellDateOnlySanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const d = parseToDate(cell.value);
  const out = d ? toISODateString(d) : '';
  return { key: cell.key, value: out };
}

export function registerDateOnlySanitizer(
  register: (name: string, fn: typeof cellDateOnlySanitizer, options: { type: 'cell' }) => void
): void {
  register(DATE_ONLY_SANITIZER_ID, cellDateOnlySanitizer, { type: 'cell' });
}
