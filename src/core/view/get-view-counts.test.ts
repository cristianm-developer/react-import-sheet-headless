import { describe, it, expect } from 'vitest';
import { getViewCounts, hasValidationErrors } from './get-view-counts.js';

function row(index: number, rowErrors: number, cellErrors: number[]) {
  return {
    index,
    errors: Array.from({ length: rowErrors }, (_, i) => ({ code: `R${i}` })),
    cells: cellErrors.map((n, i) => ({
      key: `c${i}`,
      value: 1,
      errors: Array.from({ length: n }, (_, j) => ({ code: `C${j}` })),
    })),
  };
}

describe('getViewCounts', () => {
  it('should return totalRows, rowsWithErrors and totalErrors', () => {
    const sheet = {
      name: 's',
      filesize: 0,
      documentHash: 'h',
      headers: ['a'],
      sheetLayout: { name: 'l', version: 1 },
      errors: [{ code: 'S1' }, { code: 'S2' }],
      rows: [row(0, 0, [0, 0]), row(1, 1, [0, 1]), row(2, 0, [2, 0])],
    } as import('../../types/sheet.js').Sheet;
    const counts = getViewCounts(sheet);
    expect(counts.totalRows).toBe(3);
    expect(counts.rowsWithErrors).toBe(1);
    expect(counts.totalErrors).toBe(2 + 1 + 1 + 2);
  });
});

describe('hasValidationErrors', () => {
  it('should return false when sheet is null', () => {
    expect(hasValidationErrors(null)).toBe(false);
  });

  it('should return false when sheet has no errors', () => {
    const sheet = {
      name: 's',
      filesize: 0,
      documentHash: 'h',
      headers: ['a'],
      sheetLayout: { name: 'l', version: 1 },
      errors: [],
      rows: [row(0, 0, [0, 0])],
    } as import('../../types/sheet.js').Sheet;
    expect(hasValidationErrors(sheet)).toBe(false);
  });

  it('should return true when sheet has any errors', () => {
    const sheet = {
      name: 's',
      filesize: 0,
      documentHash: 'h',
      headers: ['a'],
      sheetLayout: { name: 'l', version: 1 },
      errors: [{ code: 'E1' }],
      rows: [row(0, 0, [0, 0])],
    } as import('../../types/sheet.js').Sheet;
    expect(hasValidationErrors(sheet)).toBe(true);
  });
});
