import { describe, it, expect } from 'vitest';
import { applyValidatorDelta } from './patch-delta.js';

const initialSheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  sheetLayout: { name: 'l', version: '1' },
  errors: [] as readonly { code: string; level?: string }[],
  rows: [
    {
      index: 0,
      errors: [] as readonly { code: string }[],
      cells: [{ key: 'a', value: 1, errors: [] as readonly { code: string }[] }],
    },
  ],
};

describe('applyValidatorDelta', () => {
  it('should apply cell-level errors to the correct cell', () => {
    const delta = {
      errors: [
        { rowIndex: 0, cellKey: 'a', error: { code: 'REQUIRED', level: 'error' } },
      ],
    };
    const result = applyValidatorDelta(initialSheet, delta);
    expect(result.rows[0]!.cells[0]!.errors).toHaveLength(1);
    expect(result.rows[0]!.cells[0]!.errors[0]!.code).toBe('REQUIRED');
  });

  it('should apply row-level errors to the row', () => {
    const delta = {
      errors: [{ rowIndex: 0, error: { code: 'ROW_ERR', level: 'error' } }],
    };
    const result = applyValidatorDelta(initialSheet, delta);
    expect(result.rows[0]!.errors).toHaveLength(1);
    expect(result.rows[0]!.errors[0]!.code).toBe('ROW_ERR');
  });

  it('should apply sheet-level errors to sheet.errors', () => {
    const delta = {
      errors: [{ error: { code: 'EXTERNAL_VALIDATION_FAILED', level: 'fatal' } }],
    };
    const result = applyValidatorDelta(initialSheet, delta);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('EXTERNAL_VALIDATION_FAILED');
  });

  it('should not mutate the input sheet', () => {
    const delta = { errors: [{ rowIndex: 0, cellKey: 'a', error: { code: 'X' } }] };
    applyValidatorDelta(initialSheet, delta);
    expect(initialSheet.rows[0]!.cells[0]!.errors).toHaveLength(0);
  });
});
