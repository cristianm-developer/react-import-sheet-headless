import type { FieldValueType } from '../../../types/sheet-layout.js';
import type { RawSheetCellValue } from '../../../types/raw-sheet.js';
import type { ConvertedSheetCell } from '../../convert/types/converted-sheet.js';

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/,/g, '').trim());
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Date) return v.getTime();
  return null;
}

function toString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function toBool(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === '') return false;
  }
  if (typeof v === 'number') return v !== 0 && !Number.isNaN(v);
  return Boolean(v);
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function applyValueTypeCasting(
  cell: ConvertedSheetCell,
  valueType: FieldValueType | undefined,
): ConvertedSheetCell {
  if (!valueType) return cell;
  let value: RawSheetCellValue = cell.value;
  switch (valueType) {
    case 'number':
      value = toNumber(cell.value);
      break;
    case 'string':
      value = toString(cell.value);
      break;
    case 'bool':
      value = toBool(cell.value);
      break;
    case 'date':
      value = toDate(cell.value);
      break;
    default:
      break;
  }
  return { key: cell.key, value };
}
