import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const NULL_TO_EMPTY_SANITIZER_ID = 'nullToEmpty';

function nullToEmpty(value: unknown): string | number | boolean | Date {
  if (value === null || value === undefined) return '';
  return value as string | number | boolean | Date;
}

export function cellNullToEmptySanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: nullToEmpty(cell.value) };
}

export function registerNullToEmptySanitizer(
  register: (name: string, fn: typeof cellNullToEmptySanitizer, options: { type: 'cell' }) => void
): void {
  register(NULL_TO_EMPTY_SANITIZER_ID, cellNullToEmptySanitizer, { type: 'cell' });
}
