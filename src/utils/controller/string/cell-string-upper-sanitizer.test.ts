import { describe, it, expect, vi } from 'vitest';
import {
  cellStringUpperSanitizer,
  STRING_UPPER_SANITIZER_ID,
  registerStringUpperSanitizer,
} from './cell-string-upper-sanitizer.js';

describe('cellStringUpperSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should convert to uppercase', () => {
    expect(cellStringUpperSanitizer({ key: 'a', value: 'hello' }, row)).toEqual({
      key: 'a',
      value: 'HELLO',
    });
  });

  it('should return empty for null', () => {
    expect(cellStringUpperSanitizer({ key: 'a', value: null }, row)).toEqual({
      key: 'a',
      value: '',
    });
  });
});

describe('registerStringUpperSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringUpperSanitizer(register);
    expect(register).toHaveBeenCalledWith(STRING_UPPER_SANITIZER_ID, cellStringUpperSanitizer, {
      type: 'cell',
    });
  });
});
