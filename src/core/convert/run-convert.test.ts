import { describe, expect, it } from 'vitest';
import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import { runConvert } from './run-convert.js';

function makeRawSheet(headers: string[], rows: unknown[][]): RawSheet {
  return {
    name: 'Sheet1',
    filesize: 0,
    documentHash: '',
    headers,
    rows: rows.map((cells, index) => ({
      index,
      cells: cells.map((value, i) => ({ key: headers[i] ?? '', value })),
    })),
  };
}

function makeLayout(fieldNames: string[]): SheetLayout {
  const fields: Record<string, { name: string }> = {};
  for (const name of fieldNames) {
    fields[name] = { name };
  }
  return { name: 'Test', version: '1', fields };
}

describe('runConvert', () => {
  it('should return ConvertSuccess when all layout fields match', () => {
    const raw = makeRawSheet(['Email', 'Name'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const result = runConvert(raw, layout);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.sheet.headers).toEqual(['Email', 'Name']);
      expect(result.sheet.rows[0]?.cells.map((c) => c.value)).toEqual(['a@b.com', 'Alice']);
    }
  });

  it('should return mismatch result with headersFound and mismatches when a column is missing', () => {
    const raw = makeRawSheet(['Email'], [['a@b.com']]);
    const layout = makeLayout(['Email', 'Name']);
    const result = runConvert(raw, layout);
    expect(result.kind).toBe('mismatch');
    if (result.kind === 'mismatch') {
      expect(result.headersFound).toEqual(['Email']);
      expect(result.mismatches).toHaveLength(1);
      expect(result.mismatches[0]).toMatchObject({ expected: 'Name', found: null });
      expect(result.columnOrder).toEqual(['Email', 'Name']);
      expect(result.headerToFieldMap).toEqual({});
    }
  });

  it('should use existing columnOrder and headerToFieldMap when provided', () => {
    const raw = makeRawSheet(['Col1', 'Col2'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const result = runConvert(raw, layout, {}, {
      columnOrder: ['Name', 'Email'],
      headerToFieldMap: { Col1: 'Email', Col2: 'Name' },
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.sheet.headers).toEqual(['Name', 'Email']);
      expect(result.sheet.rows[0]?.cells).toEqual([
        { key: 'Name', value: 'Alice' },
        { key: 'Email', value: 'a@b.com' },
      ]);
    }
  });

  it('should return ConvertSuccess after applying mapping via existing', () => {
    const raw = makeRawSheet(['File Email', 'File Name'], [['x@y.com', 'Bob']]);
    const layout = makeLayout(['Email', 'Name']);
    const first = runConvert(raw, layout);
    expect(first.kind).toBe('mismatch');
    if (first.kind !== 'mismatch') return;
    const withMap = runConvert(raw, layout, {}, {
      columnOrder: first.columnOrder,
      headerToFieldMap: { 'File Email': 'Email', 'File Name': 'Name' },
    });
    expect(withMap.kind).toBe('success');
    if (withMap.kind === 'success') {
      expect(withMap.sheet.rows[0]?.cells.find((c) => c.key === 'Email')?.value).toBe('x@y.com');
      expect(withMap.sheet.rows[0]?.cells.find((c) => c.key === 'Name')?.value).toBe('Bob');
    }
  });
});
