import { describe, it, expect } from 'vitest';
import { getRowByIndex, getCellByKey } from './resolve.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a', 'b'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [] as readonly unknown[],
  rows: [
    {
      index: 0,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 1, errors: [] as readonly unknown[] },
        { key: 'b', value: 'x', errors: [] as readonly unknown[] },
      ],
    },
    {
      index: 1,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 2, errors: [] as readonly unknown[] },
        { key: 'b', value: 'y', errors: [] as readonly unknown[] },
      ],
    },
  ],
} as import('../../types/sheet.js').Sheet;

describe('getRowByIndex', () => {
  it('should return the row when index exists', () => {
    const row = getRowByIndex(sheet, 0);
    expect(row).toBeDefined();
    expect(row!.index).toBe(0);
    expect(row!.cells).toHaveLength(2);
  });

  it('should return the row for second index', () => {
    const row = getRowByIndex(sheet, 1);
    expect(row).toBeDefined();
    expect(row!.index).toBe(1);
    expect(row!.cells[0]!.value).toBe(2);
  });

  it('should return undefined when row index does not exist', () => {
    expect(getRowByIndex(sheet, 5)).toBeUndefined();
    expect(getRowByIndex(sheet, -1)).toBeUndefined();
  });
});

describe('getCellByKey', () => {
  const row = sheet.rows[0]!;
  it('should return the cell when key exists', () => {
    const cell = getCellByKey(row, 'a');
    expect(cell).toBeDefined();
    expect(cell!.key).toBe('a');
    expect(cell!.value).toBe(1);
  });

  it('should return the cell for key b', () => {
    const cell = getCellByKey(row, 'b');
    expect(cell).toBeDefined();
    expect(cell!.value).toBe('x');
  });

  it('should return undefined when cell key does not exist', () => {
    expect(getCellByKey(row, 'z')).toBeUndefined();
  });
});
