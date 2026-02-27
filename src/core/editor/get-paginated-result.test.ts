import { describe, it, expect } from 'vitest';
import { getPaginatedResult, getPaginatedResultFromRows } from './get-paginated-result.js';

function makeRow(index: number) {
  return {
    index,
    errors: [] as readonly unknown[],
    cells: [{ key: 'a', value: index, errors: [] as readonly unknown[] }],
  };
}
const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [] as readonly unknown[],
  rows: [makeRow(0), makeRow(1), makeRow(2), makeRow(3), makeRow(4)],
} as import('../../types/sheet.js').Sheet;

describe('getPaginatedResult', () => {
  it('should return correct page, pageSize, totalCount, totalPages and rows slice', () => {
    const out = getPaginatedResult(sheet, 1, 2);
    expect(out.page).toBe(1);
    expect(out.pageSize).toBe(2);
    expect(out.totalCount).toBe(5);
    expect(out.totalPages).toBe(3);
    expect(out.rows).toHaveLength(2);
    expect(out.rows[0]!.index).toBe(0);
    expect(out.rows[1]!.index).toBe(1);
  });

  it('should return rows as same references as sheet.rows for that range', () => {
    const out = getPaginatedResult(sheet, 2, 2);
    expect(out.rows[0]).toBe(sheet.rows[2]);
    expect(out.rows[1]).toBe(sheet.rows[3]);
  });

  it('should use global row indices (row.index) in returned rows', () => {
    const out = getPaginatedResult(sheet, 2, 2);
    expect(out.rows[0]!.index).toBe(2);
    expect(out.rows[1]!.index).toBe(3);
  });

  it('should handle last partial page', () => {
    const out = getPaginatedResult(sheet, 3, 2);
    expect(out.page).toBe(3);
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]!.index).toBe(4);
  });

  it('should clamp page when greater than totalPages', () => {
    const out = getPaginatedResult(sheet, 10, 2);
    expect(out.page).toBe(3);
    expect(out.rows).toHaveLength(1);
  });

  it('should handle pageSize greater than totalCount', () => {
    const out = getPaginatedResult(sheet, 1, 100);
    expect(out.totalPages).toBe(1);
    expect(out.rows).toHaveLength(5);
  });

  it('should return zero totalPages when pageSize is 0', () => {
    const out = getPaginatedResult(sheet, 1, 0);
    expect(out.totalPages).toBe(0);
    expect(out.rows).toHaveLength(0);
  });
});

describe('getPaginatedResultFromRows', () => {
  it('should return correct slice and totalCount from row array', () => {
    const rows = [10, 20, 30, 40];
    const out = getPaginatedResultFromRows(rows, 2, 2);
    expect(out.page).toBe(2);
    expect(out.pageSize).toBe(2);
    expect(out.totalCount).toBe(4);
    expect(out.totalPages).toBe(2);
    expect(out.rows).toEqual([30, 40]);
  });
});
