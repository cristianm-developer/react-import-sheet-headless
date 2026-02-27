import * as XLSX from 'xlsx';
import { describe, expect, it } from 'vitest';
import { parseSheet } from './adapter.js';

function makeXlsxBlob(rows: unknown[][]): Blob {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('parseSheet', () => {
  it('should route CSV by extension and return RawParseResult with documentHash', async () => {
    const blob = new Blob(['x,y\n1,2'], {
      type: 'text/csv',
    });
    const result = await parseSheet(blob, { fileName: 'data.csv', maxRows: 10 });
    expect(result.sheets).toBeDefined();
    const name = Object.keys(result.sheets)[0];
    const sheet = result.sheets[name ?? ''];
    expect(sheet?.documentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(sheet?.headers).toEqual(['x', 'y']);
    expect(sheet?.rows).toHaveLength(1);
  });

  it('should route XLSX by MIME and return RawParseResult', async () => {
    const blob = makeXlsxBlob([['A', 'B'], [1, 2]]);
    const result = await parseSheet(blob, { maxRows: 5 });
    expect(result.sheets.Sheet1).toBeDefined();
    expect(result.sheets.Sheet1?.documentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.sheets.Sheet1?.headers).toEqual(['A', 'B']);
  });

  it('should route CSV by fileName in options when blob has no name', async () => {
    const blob = new Blob(['a,b\n1,2'], { type: 'application/octet-stream' });
    const result = await parseSheet(blob, { fileName: 'data.csv', maxRows: 5 });
    expect(Object.keys(result.sheets)).toHaveLength(1);
    const sheet = Object.values(result.sheets)[0];
    expect(sheet?.headers).toEqual(['a', 'b']);
  });

  it('should route XLSX by File name when File is passed', async () => {
    const blob = makeXlsxBlob([['X', 'Y'], [1, 2]]);
    const file = new File([blob], 'book.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const result = await parseSheet(file, { maxRows: 2 });
    expect(result.sheets.Sheet1?.headers).toEqual(['X', 'Y']);
  });

  it('should use csv engine when options.engine is csv', async () => {
    const blob = new Blob(['a,b\n1,2'], { type: 'application/octet-stream' });
    const result = await parseSheet(blob, { fileName: 'data.bin', engine: 'csv', maxRows: 5 });
    expect(Object.keys(result.sheets)).toHaveLength(1);
    const sheet = Object.values(result.sheets)[0];
    expect(sheet?.headers).toEqual(['a', 'b']);
  });

  it('should use xlsx engine when options.engine is xlsx', async () => {
    const blob = makeXlsxBlob([['X', 'Y'], [1, 2]]);
    const result = await parseSheet(blob, { engine: 'xlsx', maxRows: 2 });
    expect(result.sheets.Sheet1?.headers).toEqual(['X', 'Y']);
  });

  it('should throw for unsupported file type when extension and MIME are unknown', async () => {
    const blob = new Blob(['x'], { type: 'application/octet-stream' });
    await expect(parseSheet(blob)).rejects.toThrow(/Unsupported file type/);
  });
});
