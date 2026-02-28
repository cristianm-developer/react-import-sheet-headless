import { describe, it, expect, vi } from 'vitest';
import {
  cellStringCollapseSpacesSanitizer,
  STRING_COLLAPSE_SPACES_SANITIZER_ID,
  registerStringCollapseSpacesSanitizer,
} from './cell-string-collapse-spaces-sanitizer.js';

describe('cellStringCollapseSpacesSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should collapse multiple spaces to single space and trim', () => {
    expect(cellStringCollapseSpacesSanitizer({ key: 'a', value: '  a   b   c  ' }, row)).toEqual({
      key: 'a',
      value: 'a b c',
    });
  });
});

describe('registerStringCollapseSpacesSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerStringCollapseSpacesSanitizer(register);
    expect(register).toHaveBeenCalledWith(
      STRING_COLLAPSE_SPACES_SANITIZER_ID,
      cellStringCollapseSpacesSanitizer,
      { type: 'cell' }
    );
  });
});
