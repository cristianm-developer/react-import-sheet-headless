import { describe, it, expect, vi } from 'vitest';
import {
  cellTimestampSanitizer,
  TIMESTAMP_SANITIZER_ID,
  registerTimestampSanitizer,
} from './cell-timestamp-sanitizer.js';

describe('cellTimestampSanitizer', () => {
  const row = { index: 0, cells: [] };

  it('should return timestamp from date string', () => {
    const out = cellTimestampSanitizer({ key: 'a', value: '2025-03-01T00:00:00Z' }, row);
    expect(typeof out.value).toBe('number');
    expect(out.value).toBeGreaterThan(0);
  });

  it('should return 0 for null', () => {
    expect(cellTimestampSanitizer({ key: 'a', value: null }, row)).toEqual({ key: 'a', value: 0 });
  });
});

describe('registerTimestampSanitizer', () => {
  it('should register with id and cell type', () => {
    const register = vi.fn();
    registerTimestampSanitizer(register);
    expect(register).toHaveBeenCalledWith(TIMESTAMP_SANITIZER_ID, cellTimestampSanitizer, {
      type: 'cell',
    });
  });
});
