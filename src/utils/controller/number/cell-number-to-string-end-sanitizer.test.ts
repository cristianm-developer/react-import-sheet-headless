import { describe, it, expect, vi } from 'vitest';
import {
  cellNumberToStringEndSanitizer,
  NUMBER_TO_STRING_END_SANITIZER_ID,
  registerNumberToStringEndSanitizer,
} from './cell-number-to-string-end-sanitizer.js';

describe('cellNumberToStringEndSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should pad numeric part at end', () => {
    expect(
      cellNumberToStringEndSanitizer({ key: 'a', value: '42' }, row, { length: 5, fill: '0' })
    ).toEqual({
      key: 'a',
      value: '42000',
    });
  });
});

describe('registerNumberToStringEndSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerNumberToStringEndSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      NUMBER_TO_STRING_END_SANITIZER_ID,
      cellNumberToStringEndSanitizer,
      { type: 'cell' }
    );
  });
});
