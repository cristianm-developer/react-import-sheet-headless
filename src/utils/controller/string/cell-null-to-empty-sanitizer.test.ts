import { describe, it, expect, vi } from 'vitest';
import {
  cellNullToEmptySanitizer,
  NULL_TO_EMPTY_SANITIZER_ID,
  registerNullToEmptySanitizer,
} from './cell-null-to-empty-sanitizer.js';

describe('cellNullToEmptySanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should convert null to empty string', () => {
    expect(cellNullToEmptySanitizer({ key: 'a', value: null }, row)).toEqual({
      key: 'a',
      value: '',
    });
  });

  it('should convert undefined to empty string', () => {
    expect(cellNullToEmptySanitizer({ key: 'a', value: undefined }, row)).toEqual({
      key: 'a',
      value: '',
    });
  });

  it('should leave non-null value unchanged', () => {
    expect(cellNullToEmptySanitizer({ key: 'a', value: 'x' }, row)).toEqual({
      key: 'a',
      value: 'x',
    });
  });
});

describe('registerNullToEmptySanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerNullToEmptySanitizer(register);
    expect(register).toHaveBeenCalledWith(NULL_TO_EMPTY_SANITIZER_ID, cellNullToEmptySanitizer, {
      type: 'cell',
    });
  });
});
