import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const DATE_YEAR_SANITIZER_ID = 'data:year';

function parseToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

export function cellDateYearSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const d = parseToDate(cell.value);
  const out = d ? d.getFullYear() : '';
  return { key: cell.key, value: out };
}

export function registerDateYearSanitizer(
  register: (name: string, fn: typeof cellDateYearSanitizer, options: { type: 'cell' }) => void
): void {
  register(DATE_YEAR_SANITIZER_ID, cellDateYearSanitizer, { type: 'cell' });
}
