import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const NUMBER_TO_STRING_ID_SANITIZER_ID = 'number:toStringId';

type Params = { length?: number; fill?: string };

function padStart(value: unknown, length: number, fill: string): string {
  const raw = value === null || value === undefined ? '' : String(value).trim().replace(/\D/g, '');
  const num = raw.slice(-length);
  return num.padStart(length, fill);
}

export function cellNumberToStringIdSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { length = 4, fill = '0' } = (params ?? {}) as Params;
  const safeLength = Math.max(0, Number(length) || 0);
  const safeFill = typeof fill === 'string' && fill.length > 0 ? fill[0]! : '0';
  return { key: cell.key, value: padStart(cell.value, safeLength, safeFill) };
}

export function registerNumberToStringIdSanitizer(
  register: (
    name: string,
    fn: typeof cellNumberToStringIdSanitizer,
    options: { type: 'cell' }
  ) => void
): void {
  register(NUMBER_TO_STRING_ID_SANITIZER_ID, cellNumberToStringIdSanitizer, { type: 'cell' });
}
