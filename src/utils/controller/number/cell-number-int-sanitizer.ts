import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const NUMBER_INT_SANITIZER_ID = 'number';

function toInt(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const s = String(value).replace(/[^\d-]/g, '');
  const parsed = parseInt(s, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function cellNumberIntSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: toInt(cell.value) };
}

export function registerNumberIntSanitizer(
  register: (name: string, fn: typeof cellNumberIntSanitizer, options: { type: 'cell' }) => void
): void {
  register(NUMBER_INT_SANITIZER_ID, cellNumberIntSanitizer, { type: 'cell' });
}
