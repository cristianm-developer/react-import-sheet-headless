import type { ConvertedSheetCell, ConvertedSheetRow } from '../../../core/convert/types/converted-sheet.js';

export const TRIM_SANITIZER_ID = 'trim';

function trimValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

export function cellTrimSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>,
): ConvertedSheetCell {
  return { key: cell.key, value: trimValue(cell.value) };
}

export function registerTrimSanitizer(
  register: (name: string, fn: typeof cellTrimSanitizer, options: { type: 'cell' }) => void,
): void {
  register(TRIM_SANITIZER_ID, cellTrimSanitizer, { type: 'cell' });
}
