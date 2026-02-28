import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const STRING_PAD_END_SANITIZER_ID = 'string:trimAdd';

type Params = { length?: number; fill?: string };

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function cellStringPadEndSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { length = 0, fill = ' ' } = (params ?? {}) as Params;
  const safeLength = Math.max(0, Number(length) || 0);
  const s = toStringValue(cell.value);
  const out = safeLength > 0 ? s.padEnd(safeLength, fill) : s;
  return { key: cell.key, value: out };
}

export function registerStringPadEndSanitizer(
  register: (name: string, fn: typeof cellStringPadEndSanitizer, options: { type: 'cell' }) => void
): void {
  register(STRING_PAD_END_SANITIZER_ID, cellStringPadEndSanitizer, { type: 'cell' });
}
