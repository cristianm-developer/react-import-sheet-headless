import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const TIME_ONLY_SANITIZER_ID = 'data:time';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function toISOTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
}

export function cellTimeOnlySanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const d = parseToDate(cell.value);
  const out = d ? toISOTimeString(d) : '';
  return { key: cell.key, value: out };
}

export function registerTimeOnlySanitizer(
  register: (name: string, fn: typeof cellTimeOnlySanitizer, options: { type: 'cell' }) => void
): void {
  register(TIME_ONLY_SANITIZER_ID, cellTimeOnlySanitizer, { type: 'cell' });
}
