import { describe, it, expect, vi } from 'vitest';
import {
  cellStringMaxLengthSanitizer,
  STRING_MAX_LENGTH_SANITIZER_ID,
  registerStringMaxLengthSanitizer,
} from './cell-string-max-length-sanitizer.js';

describe('cellStringMaxLengthSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should truncate to maxLength', () => {
    expect(
      cellStringMaxLengthSanitizer({ key: 'a', value: 'hello world' }, row, { maxLength: 5 })
    ).toEqual({
      key: 'a',
      value: 'hello',
    });
  });

  it('should not truncate when maxLength is 0 or missing', () => {
    expect(cellStringMaxLengthSanitizer({ key: 'a', value: 'hi' }, row)).toEqual({
      key: 'a',
      value: 'hi',
    });
  });
});

describe('registerStringMaxLengthSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringMaxLengthSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      STRING_MAX_LENGTH_SANITIZER_ID,
      cellStringMaxLengthSanitizer,
      { type: 'cell' }
    );
  });
});
