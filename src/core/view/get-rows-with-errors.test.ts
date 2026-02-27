import { describe, it, expect } from 'vitest';
import { getRowsWithErrors } from './get-rows-with-errors.js';

function row(index: number, errorCount: number) {
  return {
    index,
    errors: Array.from({ length: errorCount }, (_, i) => ({ code: `E${i}` })),
    cells: [{ key: 'a', value: 1, errors: [] as readonly unknown[] }],
  };
}

describe('getRowsWithErrors', () => {
  it('should return only rows that have at least one error', () => {
    const sheet = {
      name: 's',
      filesize: 0,
      documentHash: 'h',
      headers: ['a'],
      sheetLayout: { name: 'l', version: 1 },
      errors: [],
      rows: [row(0, 0), row(1, 1), row(2, 0), row(3, 2)],
    } as import('../../types/sheet.js').Sheet;
    const out = getRowsWithErrors(sheet);
    expect(out).toHaveLength(2);
    expect(out[0]!.index).toBe(1);
    expect(out[1]!.index).toBe(3);
  });

  it('should return empty array when no row has errors', () => {
    const sheet = {
      name: 's',
      filesize: 0,
      documentHash: 'h',
      headers: ['a'],
      sheetLayout: { name: 'l', version: 1 },
      errors: [],
      rows: [row(0, 0), row(1, 0)],
    } as import('../../types/sheet.js').Sheet;
    expect(getRowsWithErrors(sheet)).toHaveLength(0);
  });
});
