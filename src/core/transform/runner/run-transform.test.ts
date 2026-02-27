import { describe, it, expect } from 'vitest';
import { runTransform } from './run-transform.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  sheetLayout: { name: 'l', version: '1' },
  errors: [] as readonly { code: string }[],
  rows: [
    {
      index: 0,
      errors: [] as readonly { code: string }[],
      cells: [{ key: 'a', value: 'hello', errors: [] as readonly { code: string }[] }],
    },
  ],
};
const sheetWithErrors = { ...sheet, errors: [{ code: 'SHEET_ERR', level: 'fatal' as const }] };
const layout = {
  name: 'l',
  version: '1',
  fields: { a: { name: 'a', transformations: ['toUpperCase'] as const } },
  rowTransformations: [],
};

describe('runTransform', () => {
  it('should return empty deltas when sheet has errors (safe-first)', async () => {
    const getters = {
      getCellTransform: () => undefined,
      getRowTransform: () => undefined,
      getSheetTransform: () => undefined,
    };
    const result = await runTransform(sheetWithErrors, layout, getters);
    expect(result.deltas).toEqual([]);
  });

  it('should return deltas from cell transforms only when no transform fn registered', async () => {
    const getters = {
      getCellTransform: (name: string) =>
        name === 'toUpperCase' ? (v: unknown) => String(v).toUpperCase() : undefined,
      getRowTransform: () => undefined,
      getSheetTransform: () => undefined,
    };
    const result = await runTransform(sheet, layout, getters);
    expect(result.deltas).toHaveLength(1);
    expect(result.deltas[0]).toEqual({ row: 0, col: 'a', newValue: 'HELLO' });
  });

  it('should skip rows with errors', async () => {
    const rowsWithError = [
      ...sheet.rows,
      {
        index: 1,
        errors: [{ code: 'ROW_ERR' }],
        cells: [{ key: 'a', value: 'world', errors: [] as readonly { code: string }[] }],
      },
    ];
    const sheetTwoRows = { ...sheet, rows: rowsWithError };
    const getters = {
      getCellTransform: () => (v: unknown) => String(v).toUpperCase(),
      getRowTransform: () => undefined,
      getSheetTransform: () => undefined,
    };
    const result = await runTransform(sheetTwoRows, layout, getters);
    expect(result.deltas).toHaveLength(1);
    expect(result.deltas[0]!.row).toBe(0);
  });

  it('should call onProgress when provided', async () => {
    const progressCalls: unknown[] = [];
    const getters = {
      getCellTransform: () => undefined,
      getRowTransform: () => undefined,
      getSheetTransform: () => undefined,
    };
    await runTransform(sheet, layout, getters, (d) => progressCalls.push(d));
    expect(progressCalls.length).toBeGreaterThan(0);
  });

  it('should not modify sheet.errors in result when sheet transforms do not fail', async () => {
    const getters = {
      getCellTransform: () => undefined,
      getRowTransform: () => undefined,
      getSheetTransform: () => undefined,
    };
    const result = await runTransform(sheet, layout, getters);
    expect(result.errors).toBeUndefined();
  });
});
