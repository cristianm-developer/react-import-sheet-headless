import { describe, expect, it } from 'vitest';
import { toRawSheetCellValue } from './normalize-cell.js';

describe('toRawSheetCellValue', () => {
  it('should return null for null, undefined and empty string', () => {
    expect(toRawSheetCellValue(null)).toBe(null);
    expect(toRawSheetCellValue(undefined)).toBe(null);
    expect(toRawSheetCellValue('')).toBe(null);
  });

  it('should return string, number and boolean as-is', () => {
    expect(toRawSheetCellValue('a')).toBe('a');
    expect(toRawSheetCellValue(1)).toBe(1);
    expect(toRawSheetCellValue(true)).toBe(true);
  });

  it('should convert Date to ISO string (Comlink-safe across worker boundary)', () => {
    const d = new Date('2025-01-01');
    expect(toRawSheetCellValue(d)).toBe(d.toISOString());
  });

  it('should treat object with getTime as date and convert to ISO string', () => {
    const dateLike = { getTime: () => 0 };
    expect(toRawSheetCellValue(dateLike)).toBe(new Date(0).toISOString());
  });

  it('should coerce other objects to string', () => {
    expect(toRawSheetCellValue({})).toBe('[object Object]');
  });
});
