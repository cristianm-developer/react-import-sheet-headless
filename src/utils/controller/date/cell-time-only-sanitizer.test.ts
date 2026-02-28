import { describe, it, expect, vi } from 'vitest';
import {
  cellTimeOnlySanitizer,
  TIME_ONLY_SANITIZER_ID,
  registerTimeOnlySanitizer,
} from './cell-time-only-sanitizer.js';

describe('cellTimeOnlySanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should return time part as HH:MM:SS', () => {
    const out = cellTimeOnlySanitizer({ key: 'a', value: '2025-03-01T14:30:00' }, row);
    expect(out.value).toBe('14:30:00');
  });

  it('should return empty for null', () => {
    expect(cellTimeOnlySanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: '' });
  });
});

describe('registerTimeOnlySanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerTimeOnlySanitizer(register);
    expect(register).toHaveBeenCalledWith(TIME_ONLY_SANITIZER_ID, cellTimeOnlySanitizer, {
      type: 'cell',
    });
  });
});
