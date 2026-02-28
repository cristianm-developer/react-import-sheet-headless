import { describe, it, expect, vi } from 'vitest';
import {
  cellReplaceStrSanitizer,
  REPLACE_FROM_STR_SANITIZER_ID,
  registerReplaceStrSanitizer,
} from './cell-replace-str-sanitizer.js';

describe('cellReplaceStrSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should replace search string with replacement', () => {
    expect(
      cellReplaceStrSanitizer({ key: 'a', value: 'foo bar foo' }, row, {
        search: 'foo',
        replacement: 'baz',
      })
    ).toEqual({ key: 'a', value: 'baz bar baz' });
  });
});

describe('registerReplaceStrSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerReplaceStrSanitizer(register);
    expect(register).toHaveBeenCalledWith(REPLACE_FROM_STR_SANITIZER_ID, cellReplaceStrSanitizer, {
      type: 'cell',
    });
  });
});
