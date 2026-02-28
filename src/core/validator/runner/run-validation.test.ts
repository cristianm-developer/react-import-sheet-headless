import { describe, it, expect } from 'vitest';
import { runValidation } from './run-validation.js';

const sanitizedSheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  rows: [
    { index: 0, cells: [{ key: 'a', value: '' }] },
    { index: 1, cells: [{ key: 'a', value: 'ok' }] },
  ],
};
const layout = {
  name: 'l',
  version: '1',
  fields: {
    a: { name: 'a', validators: ['required'] },
  },
  rowValidators: [],
};

describe('runValidation', () => {
  it('should return delta of errors only, not the sheet', async () => {
    const getters = {
      getCellValidator: () => (value: unknown) =>
        value === '' || value === null || value === undefined
          ? [{ code: 'REQUIRED', level: 'error' as const }]
          : null,
      getRowValidator: () => undefined,
      getTableValidator: () => undefined,
    };
    const result = await runValidation(sanitizedSheet, layout, getters);
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.some((e) => 'cellKey' in e && e.cellKey === 'a' && e.rowIndex === 0)).toBe(
      true
    );
  });

  it('should emit cell delta when row validator returns error with cellKey', async () => {
    const layoutWithRowValidator = {
      ...layout,
      rowValidators: ['rowCheck'],
    };
    const getters = {
      getCellValidator: () => undefined,
      getRowValidator: (name: string) =>
        name === 'rowCheck'
          ? () => [{ code: 'ROW_ERR', level: 'error' as const, cellKey: 'a' }]
          : undefined,
      getTableValidator: () => undefined,
    };
    const result = await runValidation(sanitizedSheet, layoutWithRowValidator, getters);
    const cellItem = result.errors.find(
      (e) => 'cellKey' in e && e.cellKey === 'a' && e.rowIndex === 0
    );
    expect(cellItem).toBeDefined();
    expect('error' in cellItem! && cellItem.error.code).toBe('ROW_ERR');
  });

  it('should call onProgress when provided', async () => {
    const progressCalls: unknown[] = [];
    const getters = {
      getCellValidator: () => undefined,
      getRowValidator: () => undefined,
      getTableValidator: () => undefined,
    };
    await runValidation(sanitizedSheet, layout, getters, (d) => progressCalls.push(d));
    expect(progressCalls.length).toBeGreaterThan(0);
  });
});
