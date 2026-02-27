import { describe, expect, it } from 'vitest';
import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import { buildConvertedSheet } from './build-converted-sheet.js';

function makeRawSheet(headers: string[], rows: unknown[][]): RawSheet {
  return {
    name: 'Sheet1',
    filesize: 100,
    documentHash: 'abc',
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

describe('buildConvertedSheet', () => {
  it('should build sheet with cells keyed by layout field names', () => {
    const raw = makeRawSheet(['A', 'B'], [[1, 2], [3, 4]]);
    const layout = makeLayout(['x', 'y']);
    const fieldToHeader = { x: 'A', y: 'B' };
    const sheet = buildConvertedSheet(raw, layout, ['x', 'y'], fieldToHeader);
    expect(sheet.headers).toEqual(['x', 'y']);
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[0]?.cells).toEqual([
      { key: 'x', value: 1 },
      { key: 'y', value: 2 },
    ]);
    expect(sheet.rows[1]?.cells).toEqual([
      { key: 'x', value: 3 },
      { key: 'y', value: 4 },
    ]);
  });

  it('should respect columnOrder', () => {
    const raw = makeRawSheet(['A', 'B'], [[1, 2]]);
    const layout = makeLayout(['x', 'y']);
    const fieldToHeader = { x: 'A', y: 'B' };
    const sheet = buildConvertedSheet(raw, layout, ['y', 'x'], fieldToHeader);
    expect(sheet.headers).toEqual(['y', 'x']);
    expect(sheet.rows[0]?.cells).toEqual([
      { key: 'y', value: 2 },
      { key: 'x', value: 1 },
    ]);
  });

  it('should preserve RawSheet metadata', () => {
    const raw = makeRawSheet(['H'], [['v']]);
    const layout = makeLayout(['H']);
    const sheet = buildConvertedSheet(raw, layout, ['H'], { H: 'H' });
    expect(sheet.name).toBe('Sheet1');
    expect(sheet.filesize).toBe(100);
    expect(sheet.documentHash).toBe('abc');
  });

  it('should use null for unmapped layout fields', () => {
    const raw = makeRawSheet(['A'], [['only']]);
    const layout = makeLayout(['x', 'y']);
    const fieldToHeader = { x: 'A', y: null };
    const sheet = buildConvertedSheet(raw, layout, ['x', 'y'], fieldToHeader);
    expect(sheet.rows[0]?.cells).toEqual([
      { key: 'x', value: 'only' },
      { key: 'y', value: null },
    ]);
  });
});
