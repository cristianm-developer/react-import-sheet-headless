import { describe, it, expect } from 'vitest';
import { removeRow, setCellValue } from './immutable-update.js';

const row0 = {
  index: 0,
  errors: [] as readonly unknown[],
  cells: [
    { key: 'a', value: 1, errors: [] as readonly unknown[] },
    { key: 'b', value: 'x', errors: [] as readonly unknown[] },
  ],
};
const row1 = {
  index: 1,
  errors: [] as readonly unknown[],
  cells: [
    { key: 'a', value: 2, errors: [] as readonly unknown[] },
    { key: 'b', value: 'y', errors: [] as readonly unknown[] },
  ],
};
const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a', 'b'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [] as readonly unknown[],
  rows: [row0, row1],
} as import('../../types/sheet.js').Sheet;

describe('setCellValue', () => {
  it('should return a new sheet with only the edited row as new reference', () => {
    const next = setCellValue(sheet, 0, 'a', 99);
    expect(next).not.toBe(sheet);
    expect(next.rows).not.toBe(sheet.rows);
    expect(next.rows[0]).not.toBe(sheet.rows[0]);
    expect(next.rows[1]).toBe(sheet.rows[1]);
    expect(next.rows[0]!.cells[0]!.value).toBe(99);
    expect(next.rows[0]!.cells[1]).toBe(sheet.rows[0]!.cells[1]);
  });

  it('should preserve other rows by reference (structural immutability)', () => {
    const next = setCellValue(sheet, 1, 'b', 'new');
    expect(next.rows[0]).toBe(sheet.rows[0]);
    expect(next.rows[1]).not.toBe(sheet.rows[1]);
    expect(next.rows[1]!.cells[1]!.value).toBe('new');
  });

  it('should clear cell and row errors on the edited row', () => {
    const sheetWithErrors = {
      ...sheet,
      rows: [
        {
          ...row0,
          errors: [{ code: 'E', level: 'error' }],
          cells: row0.cells.map((c) => ({ ...c, errors: [{ code: 'C', level: 'error' }] })),
        },
        row1,
      ],
    } as import('../../types/sheet.js').Sheet;
    const next = setCellValue(sheetWithErrors, 0, 'a', 10);
    expect(next.rows[0]!.errors).toHaveLength(0);
    expect(next.rows[0]!.cells[0]!.errors).toHaveLength(0);
  });

  it('should return same sheet when row index does not exist', () => {
    const next = setCellValue(sheet, 10, 'a', 1);
    expect(next).toBe(sheet);
  });

  it('should return same sheet when cell key does not exist', () => {
    const next = setCellValue(sheet, 0, 'z', 1);
    expect(next).toBe(sheet);
  });
});

describe('removeRow', () => {
  it('should return a new sheet with the row removed and rows re-indexed', () => {
    const next = removeRow(sheet, 0);
    expect(next).not.toBe(sheet);
    expect(next.rows).not.toBe(sheet.rows);
    expect(next.rows).toHaveLength(1);
    expect(next.rows[0]!.index).toBe(0);
    expect(next.rows[0]!.cells[0]!.value).toBe(2);
  });

  it('should re-index remaining rows so index equals array position', () => {
    const row2 = {
      index: 2,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 3, errors: [] as readonly unknown[] },
        { key: 'b', value: 'z', errors: [] as readonly unknown[] },
      ],
    };
    const threeRows = { ...sheet, rows: [row0, row1, row2] } as typeof sheet;
    const next = removeRow(threeRows, 1);
    expect(next.rows).toHaveLength(2);
    expect(next.rows[0]!.index).toBe(0);
    expect(next.rows[1]!.index).toBe(1);
    expect(next.rows[1]!.cells[0]!.value).toBe(3);
  });

  it('should return same sheet when row index does not exist', () => {
    const next = removeRow(sheet, 10);
    expect(next).toBe(sheet);
  });
});
