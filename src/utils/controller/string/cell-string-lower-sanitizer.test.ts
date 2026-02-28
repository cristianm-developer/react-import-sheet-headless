import { describe, it, expect, vi } from 'vitest';
import {
  cellStringLowerSanitizer,
  STRING_LOWER_SANITIZER_ID,
  registerStringLowerSanitizer,
} from './cell-string-lower-sanitizer.js';

describe('cellStringLowerSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should convert to lowercase', () => {
    expect(cellStringLowerSanitizer({ key: 'a', value: 'HELLO' }, row)).toEqual({
      key: 'a',
      value: 'hello',
    });
  });

  it('should return empty for null', () => {
    expect(cellStringLowerSanitizer({ key: 'a', value: null }, row)).toEqual({
      key: 'a',
      value: '',
    });
  });
});

describe('registerStringLowerSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringLowerSanitizer(register);
    expect(register).toHaveBeenCalledWith(STRING_LOWER_SANITIZER_ID, cellStringLowerSanitizer, {
      type: 'cell',
    });
  });
});
