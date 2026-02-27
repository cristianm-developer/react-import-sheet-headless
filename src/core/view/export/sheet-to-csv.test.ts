import { describe, it, expect } from 'vitest';
import { sheetToCSV } from './sheet-to-csv.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['Name', 'Score'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [],
  rows: [
    {
      index: 0,
      errors: [],
      cells: [
        { key: 'Name', value: 'Alice', errors: [] },
        { key: 'Score', value: 90, errors: [] },
      ],
    },
    {
      index: 1,
      errors: [],
      cells: [
        { key: 'Name', value: 'Bob', errors: [] },
        { key: 'Score', value: 85, errors: [] },
      ],
    },
  ],
} as import('../../../types/sheet.js').Sheet;

const layout = {
  name: 'l',
  version: 1,
  fields: { Score: { name: 'Score' }, Name: { name: 'Name' } } as import('../../../types/sheet-layout.js').SheetLayout['fields'],
} as import('../../../types/sheet-layout.js').SheetLayout;

describe('sheetToCSV', () => {
  it('should include BOM at start for Excel UTF-8', () => {
    const out = sheetToCSV(sheet, layout, { includeHeaders: true });
    expect(out.charCodeAt(0)).toBe(0xfeff);
  });

  it('should include header row when includeHeaders is true', () => {
    const out = sheetToCSV(sheet, layout, { includeHeaders: true });
    expect(out).toContain('Score');
    expect(out).toContain('Name');
  });

  it('should use layout field order when provided', () => {
    const out = sheetToCSV(sheet, layout, { includeHeaders: true });
    const firstLine = out.split('\r\n')[1];
    expect(firstLine).toMatch(/90.*Alice/);
  });

  it('should use custom separator', () => {
    const out = sheetToCSV(sheet, layout, { csvSeparator: ';' });
    expect(out).toContain(';');
    expect(out).not.toContain('Alice,Bob');
  });

  it('should escape values containing separator and quotes', () => {
    const sheetWithComma = {
      ...sheet,
      rows: [
        {
          index: 0,
          errors: [],
          cells: [
            { key: 'Name', value: 'Say "hello"', errors: [] },
            { key: 'Score', value: 'a,b', errors: [] },
          ],
        },
      ],
    } as import('../../../types/sheet.js').Sheet;
    const out = sheetToCSV(sheetWithComma, layout, { includeHeaders: true });
    expect(out).toContain('"Say ""hello"""');
    expect(out).toContain('"a,b"');
  });
});
