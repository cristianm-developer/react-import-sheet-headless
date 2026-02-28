import { describe, it, expect, vi } from 'vitest';
import {
  cellStringPadEndSanitizer,
  STRING_PAD_END_SANITIZER_ID,
  registerStringPadEndSanitizer,
} from './cell-string-pad-end-sanitizer.js';

describe('cellStringPadEndSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should pad at end to length', () => {
    expect(
      cellStringPadEndSanitizer({ key: 'a', value: 'x' }, row, { length: 4, fill: '0' })
    ).toEqual({
      key: 'a',
      value: 'x000',
    });
  });
});

describe('registerStringPadEndSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringPadEndSanitizer(register);
    expect(register).toHaveBeenCalledWith(STRING_PAD_END_SANITIZER_ID, cellStringPadEndSanitizer, {
      type: 'cell',
    });
  });
});
