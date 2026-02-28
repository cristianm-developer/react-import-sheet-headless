import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const TIMESTAMP_SANITIZER_ID = 'data:timestamp';

function parseToTimestamp(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  const ms = Date.parse(String(value).trim());
  return Number.isNaN(ms) ? 0 : ms;
}

export function cellTimestampSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: parseToTimestamp(cell.value) };
}

export function registerTimestampSanitizer(
  register: (name: string, fn: typeof cellTimestampSanitizer, options: { type: 'cell' }) => void
): void {
  register(TIMESTAMP_SANITIZER_ID, cellTimestampSanitizer, { type: 'cell' });
}
