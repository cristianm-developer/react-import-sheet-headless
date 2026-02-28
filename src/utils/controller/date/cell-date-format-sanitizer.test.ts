import { describe, it, expect, vi } from 'vitest';
import {
  cellDateFormatSanitizer,
  DATE_FORMAT_SANITIZER_ID,
  registerDateFormatSanitizer,
} from './cell-date-format-sanitizer.js';

describe('cellDateFormatSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should format valid date string', () => {
    const out = cellDateFormatSanitizer({ key: 'a', value: '2025-03-01' }, row);
    expect(out.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it('should return empty for null', () => {
    expect(cellDateFormatSanitizer({ key: 'a', value: null }, row)).toEqual({
      key: 'a',
      value: '',
    });
  });
});

describe('registerDateFormatSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerDateFormatSanitizer(register);
    expect(register).toHaveBeenCalledWith(DATE_FORMAT_SANITIZER_ID, cellDateFormatSanitizer, {
      type: 'cell',
    });
  });
});
