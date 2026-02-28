import { describe, it, expect, vi } from 'vitest';
import {
  cellNumberToStringIdSanitizer,
  NUMBER_TO_STRING_ID_SANITIZER_ID,
  registerNumberToStringIdSanitizer,
} from './cell-number-to-string-id-sanitizer.js';

describe('cellNumberToStringIdSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should pad numeric part at start with zeros', () => {
    expect(cellNumberToStringIdSanitizer({ key: 'a', value: '42' }, row, { length: 4 })).toEqual({
      key: 'a',
      value: '0042',
    });
  });

  it('should use fill param for padding', () => {
    expect(
      cellNumberToStringIdSanitizer({ key: 'a', value: '7' }, row, { length: 3, fill: '0' })
    ).toEqual({
      key: 'a',
      value: '007',
    });
  });
});

describe('registerNumberToStringIdSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerNumberToStringIdSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      NUMBER_TO_STRING_ID_SANITIZER_ID,
      cellNumberToStringIdSanitizer,
      { type: 'cell' }
    );
  });
});
