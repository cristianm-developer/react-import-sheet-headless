import { describe, it, expect } from 'vitest';
import { applyTransformDelta } from './delta-applier.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a', 'b'],
  sheetLayout: { name: 'l', version: '1' },
  errors: [] as readonly { code: string }[],
  rows: [
    {
      index: 0,
      errors: [] as readonly { code: string }[],
      cells: [
        { key: 'a', value: 1, errors: [] as readonly { code: string }[] },
        { key: 'b', value: 2, errors: [] as readonly { code: string }[] },
      ],
    },
  ],
};

describe('applyTransformDelta', () => {
  it('should return same sheet when deltas is empty', () => {
    const result = applyTransformDelta(sheet, { deltas: [] });
    expect(result).toBe(sheet);
  });

  it('should update only the specified cell', () => {
    const delta = { deltas: [{ row: 0, col: 'a', newValue: 10 }] };
    const result = applyTransformDelta(sheet, delta);
    expect(result.rows[0]!.cells[0]!.value).toBe(10);
    expect(result.rows[0]!.cells[1]!.value).toBe(2);
  });

  it('should skip deltas with row < 0', () => {
    const delta = {
      deltas: [
        { row: -1, col: '', newValue: null },
        { row: 0, col: 'b', newValue: 20 },
      ],
    };
    const result = applyTransformDelta(sheet, delta);
    expect(result.rows[0]!.cells[1]!.value).toBe(20);
  });

  it('should not mutate the input sheet', () => {
    const delta = { deltas: [{ row: 0, col: 'a', newValue: 10 }] };
    applyTransformDelta(sheet, delta);
    expect(sheet.rows[0]!.cells[0]!.value).toBe(1);
  });
});
