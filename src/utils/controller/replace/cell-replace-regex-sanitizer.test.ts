import { describe, it, expect, vi } from 'vitest';
import {
  cellReplaceRegexSanitizer,
  REPLACE_FROM_REGEX_SANITIZER_ID,
  registerReplaceRegexSanitizer,
} from './cell-replace-regex-sanitizer.js';

describe('cellReplaceRegexSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should replace pattern with replacement', () => {
    expect(
      cellReplaceRegexSanitizer({ key: 'a', value: 'hello world' }, row, {
        pattern: 'l+',
        flags: 'g',
        replacement: 'X',
      })
    ).toEqual({ key: 'a', value: 'heXo worXd' });
  });
});

describe('registerReplaceRegexSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerReplaceRegexSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      REPLACE_FROM_REGEX_SANITIZER_ID,
      cellReplaceRegexSanitizer,
      {
        type: 'cell',
      }
    );
  });
});
