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

  it('should return Date instance as-is', () => {
    const d = new Date('2025-01-01');
    expect(toRawSheetCellValue(d)).toBe(d);
  });

  it('should treat object with getTime as Date', () => {
    const dateLike = { getTime: () => 0 };
    expect(toRawSheetCellValue(dateLike)).toBe(dateLike);
  });

  it('should coerce other objects to string', () => {
    expect(toRawSheetCellValue({})).toBe('[object Object]');
  });
});
