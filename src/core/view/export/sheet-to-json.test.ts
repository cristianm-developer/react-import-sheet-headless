import { describe, it, expect } from 'vitest';
import { sheetToJSON } from './sheet-to-json.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [],
  rows: [
    {
      index: 0,
      errors: [],
      cells: [
        { key: 'a', value: 1, errors: [] },
        { key: 'b', value: 'x', errors: [] },
      ],
    },
  ],
} as import('../../../types/sheet.js').Sheet;

describe('sheetToJSON', () => {
  it('should serialize rows as array of objects', () => {
    const out = sheetToJSON(sheet, null, {});
    const parsed = JSON.parse(out) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({ a: 1, b: 'x' });
  });

  it('should format dates when formatDatesForExport is true', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const sheetWithDate = {
      ...sheet,
      rows: [
        {
          index: 0,
          errors: [],
          cells: [{ key: 'd', value: d, errors: [] }],
        },
      ],
    } as import('../../../types/sheet.js').Sheet;
    const out = sheetToJSON(sheetWithDate, null, { formatDatesForExport: true });
    const parsed = JSON.parse(out) as unknown[];
    expect(typeof (parsed[0] as Record<string, unknown>).d).toBe('string');
  });
});
