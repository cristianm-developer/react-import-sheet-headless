import { describe, it, expect, vi } from 'vitest';
import {
  cellNumberIntSanitizer,
  NUMBER_INT_SANITIZER_ID,
  registerNumberIntSanitizer,
} from './cell-number-int-sanitizer.js';

describe('cellNumberIntSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should strip non-digits and return integer', () => {
    expect(cellNumberIntSanitizer({ key: 'a', value: ' 12abc3 ' }, row)).toEqual({
      key: 'a',
      value: 123,
    });
  });

  it('should return 0 for null or undefined', () => {
    expect(cellNumberIntSanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: 0 });
  });

  it('should truncate existing number to int', () => {
    expect(cellNumberIntSanitizer({ key: 'a', value: 42.7 }, row)).toEqual({ key: 'a', value: 42 });
  });
});

describe('registerNumberIntSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerNumberIntSanitizer(register);
    expect(register).toHaveBeenCalledWith(NUMBER_INT_SANITIZER_ID, cellNumberIntSanitizer, {
      type: 'cell',
    });
  });
});
