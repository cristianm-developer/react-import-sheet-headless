import { describe, it, expect } from 'vitest';
import { runEditPipeline } from './run-edit-pipeline.js';
import type { EditPipelineGetters } from './run-edit-pipeline.js';

const sheetLayoutWithTableValidator = {
  name: 'l',
  version: 1,
  sheetValidators: ['tableErr'],
  fields: {
    a: { name: 'a', validators: [], transformations: [] },
    b: { name: 'b', validators: [], transformations: [] },
  },
} as import('../../types/sheet-layout.js').SheetLayout;

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

const noopGetters: EditPipelineGetters = {
  validator: {
    getCellValidator: () => undefined,
    getRowValidator: () => undefined,
    getTableValidator: () => undefined,
  },
  transform: {
    getCellTransform: () => undefined,
    getRowTransform: () => undefined,
    getSheetTransform: () => undefined,
  },
};

describe('runEditPipeline', () => {
  it('should return a new sheet with updated cell value and structural immutability', async () => {
    const layoutNoTable = { ...sheetLayoutWithTableValidator, sheetValidators: undefined };
    const result = await runEditPipeline(
      sheet,
      layoutNoTable,
      0,
      'a',
      99,
      noopGetters,
    );
    expect(result).not.toBe(sheet);
    expect(result.rows[0]).not.toBe(sheet.rows[0]);
    expect(result.rows[1]).toBe(sheet.rows[1]);
    expect(result.rows[0]!.cells[0]!.value).toBe(99);
  });

  it('should not run transforms when sheet has errors after validation', async () => {
    const gettersWithTableError: EditPipelineGetters = {
      ...noopGetters,
      validator: {
        ...noopGetters.validator,
        getTableValidator: (name: string) =>
          name === 'tableErr'
            ? () => [{ code: 'ERR', level: 'error' }]
            : undefined,
      },
    };
    const result = await runEditPipeline(
      sheet,
      sheetLayoutWithTableValidator,
      0,
      'a',
      99,
      gettersWithTableError,
    );
    expect(result.errors).toHaveLength(1);
    expect(result.rows[0]!.cells[0]!.value).toBe(99);
  });
});
