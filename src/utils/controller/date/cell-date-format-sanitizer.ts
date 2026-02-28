import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const DATE_FORMAT_SANITIZER_ID = 'data';

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

function toISOTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
}

function toFormatted(d: Date): string {
  return `${toISODateString(d)}T${toISOTimeString(d)}`;
}

export function cellDateFormatSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const d = parseToDate(cell.value);
  const out = d ? toFormatted(d) : '';
  return { key: cell.key, value: out };
}

export function registerDateFormatSanitizer(
  register: (name: string, fn: typeof cellDateFormatSanitizer, options: { type: 'cell' }) => void
): void {
  register(DATE_FORMAT_SANITIZER_ID, cellDateFormatSanitizer, { type: 'cell' });
}
