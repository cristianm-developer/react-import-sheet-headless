import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const NUMBER_FLOAT_SANITIZER_ID = 'float';

function toFloat(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(s);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function cellNumberFloatSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: toFloat(cell.value) };
}

export function registerNumberFloatSanitizer(
  register: (name: string, fn: typeof cellNumberFloatSanitizer, options: { type: 'cell' }) => void
): void {
  register(NUMBER_FLOAT_SANITIZER_ID, cellNumberFloatSanitizer, { type: 'cell' });
}
