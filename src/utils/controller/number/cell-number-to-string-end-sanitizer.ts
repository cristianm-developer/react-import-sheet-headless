import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const NUMBER_TO_STRING_END_SANITIZER_ID = 'number:toStringEnd';

type Params = { length?: number; fill?: string };

function padEnd(value: unknown, length: number, fill: string): string {
  const raw = value === null || value === undefined ? '' : String(value).trim().replace(/\D/g, '');
  return raw.padEnd(length, fill);
}

export function cellNumberToStringEndSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { length = 4, fill = '0' } = (params ?? {}) as Params;
  const safeLength = Math.max(0, Number(length) || 0);
  const safeFill = typeof fill === 'string' && fill.length > 0 ? fill[0]! : '0';
  return { key: cell.key, value: padEnd(cell.value, safeLength, safeFill) };
}

export function registerNumberToStringEndSanitizer(
  register: (
    name: string,
    fn: typeof cellNumberToStringEndSanitizer,
    options: { type: 'cell' }
  ) => void
): void {
  register(NUMBER_TO_STRING_END_SANITIZER_ID, cellNumberToStringEndSanitizer, { type: 'cell' });
}
