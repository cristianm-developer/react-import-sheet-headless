import { describe, it, expect, vi } from 'vitest';
import {
  cellStringPadStartSanitizer,
  STRING_PAD_START_SANITIZER_ID,
  registerStringPadStartSanitizer,
} from './cell-string-pad-start-sanitizer.js';

describe('cellStringPadStartSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should pad at start to length', () => {
    expect(
      cellStringPadStartSanitizer({ key: 'a', value: 'x' }, row, { length: 4, fill: '0' })
    ).toEqual({
      key: 'a',
      value: '000x',
    });
  });
});

describe('registerStringPadStartSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringPadStartSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      STRING_PAD_START_SANITIZER_ID,
      cellStringPadStartSanitizer,
      { type: 'cell' }
    );
  });
});
