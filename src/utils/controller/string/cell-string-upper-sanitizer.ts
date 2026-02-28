import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const STRING_UPPER_SANITIZER_ID = 'string:mayusculas';

function toUpper(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).toUpperCase();
}

export function cellStringUpperSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: toUpper(cell.value) };
}

export function registerStringUpperSanitizer(
  register: (name: string, fn: typeof cellStringUpperSanitizer, options: { type: 'cell' }) => void
): void {
  register(STRING_UPPER_SANITIZER_ID, cellStringUpperSanitizer, { type: 'cell' });
}
