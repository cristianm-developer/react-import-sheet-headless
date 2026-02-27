import type { RawSheetCellValue } from '../../../../types/raw-sheet.js';

export function toRawSheetCellValue(value: unknown): RawSheetCellValue {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'getTime' in value && typeof (value as Date).getTime === 'function') {
    return value as Date;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return String(value);
}
