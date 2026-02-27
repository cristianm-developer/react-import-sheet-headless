import { describe, it, expect } from 'vitest';
import { runRowTransforms } from './row-transforms.js';

const row = {
  index: 0,
  errors: [] as readonly { code: string }[],
  cells: [{ key: 'a', value: 1, errors: [] as readonly { code: string }[] }],
};
const sheetLayout = { name: 'l', version: '1', fields: {}, rowTransformations: ['double'] as const };

describe('runRowTransforms', () => {
  it('should return row when row has errors (safe-first)', () => {
    const rowWithErrors = { ...row, errors: [{ code: 'ROW_ERR' }] };
    const getTransform = () => (r: typeof row) => ({ ...r, cells: [] });
    const result = runRowTransforms(rowWithErrors, sheetLayout, getTransform);
    expect(result).toEqual(rowWithErrors);
  });

  it('should return row when layout has no rowTransformations', () => {
    const layout = { name: 'l', version: '1', fields: {} };
    const result = runRowTransforms(row, layout, () => undefined);
    expect(result).toEqual(row);
  });

  it('should run transform and return updated row', () => {
    const getTransform = (name: string) =>
      name === 'double' ?
        (r: typeof row) => ({
          ...r,
          cells: r.cells.map((c) => (c ? { ...c, value: Number(c.value) * 2 } : c)),
        })
      : undefined;
    const result = runRowTransforms(row, sheetLayout, getTransform);
    expect(result.cells[0]!.value).toBe(2);
  });
});
