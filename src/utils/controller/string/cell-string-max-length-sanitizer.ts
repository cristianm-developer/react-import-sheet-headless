import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const STRING_MAX_LENGTH_SANITIZER_ID = 'string:maxLength';

type Params = { maxLength?: number };

function truncate(value: unknown, maxLength: number): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return maxLength > 0 ? s.slice(0, maxLength) : s;
}

export function cellStringMaxLengthSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { maxLength = 0 } = (params ?? {}) as Params;
  const safe = Math.max(0, Number(maxLength) || 0);
  return { key: cell.key, value: truncate(cell.value, safe) };
}

export function registerStringMaxLengthSanitizer(
  register: (
    name: string,
    fn: typeof cellStringMaxLengthSanitizer,
    options: { type: 'cell' }
  ) => void
): void {
  register(STRING_MAX_LENGTH_SANITIZER_ID, cellStringMaxLengthSanitizer, { type: 'cell' });
}
