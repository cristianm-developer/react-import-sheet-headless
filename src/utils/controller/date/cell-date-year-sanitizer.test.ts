import { describe, it, expect, vi } from 'vitest';
import {
  cellDateYearSanitizer,
  DATE_YEAR_SANITIZER_ID,
  registerDateYearSanitizer,
} from './cell-date-year-sanitizer.js';

describe('cellDateYearSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should return year from date string', () => {
    expect(cellDateYearSanitizer({ key: 'a', value: '2025-03-01' }, row)).toEqual({
      key: 'a',
      value: 2025,
    });
  });

  it('should return empty for null', () => {
    expect(cellDateYearSanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: '' });
  });
});

describe('registerDateYearSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerDateYearSanitizer(register);
    expect(register).toHaveBeenCalledWith(DATE_YEAR_SANITIZER_ID, cellDateYearSanitizer, {
      type: 'cell',
    });
  });
});
