import { describe, it, expect } from 'vitest';
import { buildInitialSheet } from './build-initial-sheet.js';

const sanitizedSheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a', 'b'],
  rows: [
    { index: 0, cells: [{ key: 'a', value: 1 }, { key: 'b', value: 'x' }] },
  ],
};
const layoutRef = { name: 'layout', version: '1' };

describe('buildInitialSheet', () => {
  it('should build Sheet with empty errors on every cell, row, and sheet', () => {
    const sheet = buildInitialSheet(sanitizedSheet, layoutRef);
    expect(sheet.sheetLayout).toEqual(layoutRef);
    expect(sheet.errors).toEqual([]);
    expect(sheet.rows).toHaveLength(1);
    const row = sheet.rows[0];
    expect(row!.errors).toEqual([]);
    expect(row!.cells).toHaveLength(2);
    expect(row!.cells[0]!.errors).toEqual([]);
    expect(row!.cells[1]!.errors).toEqual([]);
  });

  it('should preserve sheet metadata and cell values', () => {
    const sheet = buildInitialSheet(sanitizedSheet, layoutRef);
    expect(sheet.name).toBe('s');
    expect(sheet.documentHash).toBe('h');
    expect(sheet.rows[0]!.cells[0]!.value).toBe(1);
    expect(sheet.rows[0]!.cells[1]!.value).toBe('x');
  });
});
