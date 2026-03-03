import type { RawSheetCellValue } from '../../../../types/raw-sheet.js';

export function toRawSheetCellValue(value: unknown): RawSheetCellValue {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value;
  // Convert Date to ISO string so Comlink can serialize across worker boundary (Date has Symbol.toPrimitive)
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (
    typeof value === 'object' &&
    value !== null &&
    'getTime' in value &&
    typeof (value as Date).getTime === 'function'
  ) {
    const ms = (value as Date).getTime();
    return Number.isNaN(ms) ? String(value) : new Date(ms).toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return String(value);
}
