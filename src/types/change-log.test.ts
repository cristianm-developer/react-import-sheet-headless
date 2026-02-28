import { describe, it, expect } from 'vitest';
import { formatChangeLogAsText } from './change-log.js';

describe('formatChangeLogAsText', () => {
  it('should format cell_edit entries with value and optional previousValue', () => {
    const entries = [
      {
        type: 'cell_edit' as const,
        rowIndex: 0,
        cellKey: 'email',
        value: 'a@b.com',
        timestamp: 1000,
      },
      {
        type: 'cell_edit' as const,
        rowIndex: 1,
        cellKey: 'name',
        value: 'Jane',
        previousValue: 'John',
        timestamp: 2000,
      },
    ];
    const text = formatChangeLogAsText(entries);
    expect(text).toBe(
      'Row 1, cell "email": set to "a@b.com"\nRow 2, cell "name": set to "Jane" (previous: John)'
    );
  });

  it('should format row_remove entries with 1-based row number', () => {
    const entries = [
      {
        type: 'row_remove' as const,
        rowIndex: 2,
        timestamp: 3000,
      },
    ];
    const text = formatChangeLogAsText(entries);
    expect(text).toBe('Row 3: removed');
  });

  it('should return empty string for empty entries', () => {
    expect(formatChangeLogAsText([])).toBe('');
  });

  it('should join multiple entries with newlines', () => {
    const entries = [
      { type: 'row_remove' as const, rowIndex: 0, timestamp: 1 },
      { type: 'cell_edit' as const, rowIndex: 0, cellKey: 'x', value: 1, timestamp: 2 },
    ];
    const text = formatChangeLogAsText(entries);
    expect(text).toBe('Row 1: removed\nRow 1, cell "x": set to 1');
  });
});
