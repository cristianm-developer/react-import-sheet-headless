import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv-parser.js';

describe('parseCsv', () => {
  it('should return RawParseResult with one sheet and parserMeta', async () => {
    const blob = new Blob(['name,age\nAlice,30\nBob,25'], { type: 'text/csv' });
    const result = await parseCsv(blob, 50, 'hash-csv', 'Data');
    expect(result.sheets.Data).toBeDefined();
    const sheet = result.sheets.Data;
    expect(sheet?.name).toBe('Data');
    expect(sheet?.documentHash).toBe('hash-csv');
    expect(sheet?.headers).toEqual(['name', 'age']);
    expect(sheet?.rows).toHaveLength(2);
    expect(sheet?.rows?.[0]?.cells).toEqual([
      { key: 'name', value: 'Alice' },
      { key: 'age', value: '30' },
    ]);
    expect(result.parserMeta?.delimiter).toBe(',');
    expect(result.parserMeta?.encoding).toBeDefined();
  });

  it('should use encodingOverride when provided', async () => {
    const blob = new Blob(['name\nTest'], { type: 'text/csv' });
    const result = await parseCsv(blob, 0, 'h', 'S', { encodingOverride: 'UTF-8' });
    expect(result.sheets.S).toBeDefined();
    expect(result.parserMeta?.encoding).toBe('UTF-8');
  });

  it('should respect delimiterOverride and maxRows', async () => {
    const blob = new Blob(['a;b;c\n1;2;3\n4;5;6\n7;8;9'], { type: 'text/csv' });
    const result = await parseCsv(blob, 0, 'h', 'S', {
      delimiterOverride: ';',
      maxRows: 2,
    });
    const sheet = result.sheets.S;
    expect(sheet?.headers).toEqual(['a', 'b', 'c']);
    expect(sheet?.rows).toHaveLength(2);
    expect(result.parserMeta?.delimiter).toBe(';');
  });
});
