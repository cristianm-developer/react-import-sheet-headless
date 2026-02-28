import { describe, it, expect, vi } from 'vitest';
import {
  cellNumberFloatSanitizer,
  NUMBER_FLOAT_SANITIZER_ID,
  registerNumberFloatSanitizer,
} from './cell-number-float-sanitizer.js';

describe('cellNumberFloatSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should strip non-numeric and return float', () => {
    expect(cellNumberFloatSanitizer({ key: 'a', value: ' 1.5x ' }, row)).toEqual({
      key: 'a',
      value: 1.5,
    });
  });

  it('should return 0 for null or undefined', () => {
    expect(cellNumberFloatSanitizer({ key: 'a', value: null }, row)).toEqual({
      key: 'a',
      value: 0,
    });
  });
});

describe('registerNumberFloatSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerNumberFloatSanitizer(register);
    expect(register).toHaveBeenCalledWith(NUMBER_FLOAT_SANITIZER_ID, cellNumberFloatSanitizer, {
      type: 'cell',
    });
  });
});
