import * as XLSX from 'xlsx';
import { describe, expect, it } from 'vitest';
import { parseXlsx } from './xlsx-parser.js';

function makeXlsxBuffer(rows: unknown[][]): ArrayBuffer {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

describe('parseXlsx', () => {
  it('should return RawParseResult with sheets, headers and rows', () => {
    const buf = makeXlsxBuffer([
      ['H1', 'H2'],
      [1, 'a'],
      [2, 'b'],
    ]);
    const result = parseXlsx(buf, 100, 'hash-1');
    expect(result.sheets).toBeDefined();
    const sheet = result.sheets['Sheet1'];
    expect(sheet).toBeDefined();
    expect(sheet?.name).toBe('Sheet1');
    expect(sheet?.documentHash).toBe('hash-1');
    expect(sheet?.filesize).toBe(100);
    expect(sheet?.headers).toEqual(['H1', 'H2']);
    expect(sheet?.rows).toHaveLength(2);
    expect(sheet?.rows?.[0]?.cells).toEqual([
      { key: 'H1', value: 1 },
      { key: 'H2', value: 'a' },
    ]);
  });

  it('should return empty headers and rows for empty sheet', () => {
    const buf = makeXlsxBuffer([]);
    const result = parseXlsx(buf, 0, 'h');
    expect(result.sheets.Sheet1).toBeDefined();
    expect(result.sheets.Sheet1?.headers).toEqual([]);
    expect(result.sheets.Sheet1?.rows).toEqual([]);
  });

  it('should respect maxRows option', () => {
    const buf = makeXlsxBuffer([
      ['A', 'B'],
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const result = parseXlsx(buf, 0, 'h', undefined, { maxRows: 2 });
    const sheet = result.sheets['Sheet1'];
    expect(sheet?.rows).toHaveLength(2);
    expect(sheet?.rowsCount).toBe(3);
  });
});
