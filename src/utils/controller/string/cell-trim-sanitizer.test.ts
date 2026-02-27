import { describe, it, expect, vi } from 'vitest';
import { cellTrimSanitizer, TRIM_SANITIZER_ID, registerTrimSanitizer } from './cell-trim-sanitizer.js';

describe('cellTrimSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should trim string values', () => {
    expect(cellTrimSanitizer({ key: 'a', value: '  x  ' }, row)).toEqual({ key: 'a', value: 'x' });
  });

  it('should return empty string for null or undefined', () => {
    expect(cellTrimSanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: '' });
  });

  it('should convert non-strings to string and trim', () => {
    expect(cellTrimSanitizer({ key: 'a', value: 42 }, row)).toEqual({ key: 'a', value: '42' });
  });
});

describe('TRIM_SANITIZER_ID', () => {
  it('should be "trim"', () => {
    expect(TRIM_SANITIZER_ID).toBe('trim');
  });
});

describe('registerTrimSanitizer', () => {
  it('should call register with trim id and cell type', () => {
    const register = vi.fn();
    registerTrimSanitizer(register);
    expect(register).toHaveBeenCalledWith(TRIM_SANITIZER_ID, cellTrimSanitizer, { type: 'cell' });
  });
});
