import { describe, it, expect, vi } from 'vitest';
import {
  cellDateOnlySanitizer,
  DATE_ONLY_SANITIZER_ID,
  registerDateOnlySanitizer,
} from './cell-date-only-sanitizer.js';

describe('cellDateOnlySanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should return ISO date without time', () => {
    const out = cellDateOnlySanitizer({ key: 'a', value: '2025-03-01T10:00:00' }, row);
    expect(out.value).toBe('2025-03-01');
  });

  it('should return empty for null', () => {
    expect(cellDateOnlySanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: '' });
  });
});

describe('registerDateOnlySanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerDateOnlySanitizer(register);
    expect(register).toHaveBeenCalledWith(DATE_ONLY_SANITIZER_ID, cellDateOnlySanitizer, {
      type: 'cell',
    });
  });
});
