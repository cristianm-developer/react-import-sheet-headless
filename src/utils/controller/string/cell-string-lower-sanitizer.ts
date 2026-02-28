import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const STRING_LOWER_SANITIZER_ID = 'string:minusculas';

function toLower(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).toLowerCase();
}

export function cellStringLowerSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: toLower(cell.value) };
}

export function registerStringLowerSanitizer(
  register: (name: string, fn: typeof cellStringLowerSanitizer, options: { type: 'cell' }) => void
): void {
  register(STRING_LOWER_SANITIZER_ID, cellStringLowerSanitizer, { type: 'cell' });
}
