import { describe, it, expect, vi } from 'vitest';
import { runSheetTransforms, EXTERNAL_TRANSFORM_FAILED } from './sheet-transforms.js';

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
      cells: [{ key: 'a', value: 1, errors: [] as readonly { code: string }[] }],
    },
  ],
};
const layout = { name: 'l', version: '1', fields: {}, sheetTransformations: ['enrich'] as const };

describe('runSheetTransforms', () => {
  it('should return empty deltas and errors when no sheetTransformations', async () => {
    const layoutEmpty = { name: 'l', version: '1', fields: {} };
    const result = await runSheetTransforms(sheet, layoutEmpty, () => undefined);
    expect(result).toEqual({ deltas: [], errors: [] });
  });

  it('should collect deltas from async transform', async () => {
    const getTransform = () => () =>
      Promise.resolve([{ row: 0, col: 'a', newValue: 99 }]);
    const result = await runSheetTransforms(sheet, layout, getTransform);
    expect(result.deltas).toHaveLength(1);
    expect(result.deltas[0]).toEqual({ row: 0, col: 'a', newValue: 99 });
    expect(result.errors).toHaveLength(0);
  });

  it('should push EXTERNAL_TRANSFORM_FAILED on throw', async () => {
    const getTransform = () => () => {
      throw new Error('network');
    };
    const result = await runSheetTransforms(sheet, layout, getTransform);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe(EXTERNAL_TRANSFORM_FAILED);
  });

  it('should not call getTransform for missing name', async () => {
    const getTransform = vi.fn(() => undefined);
    await runSheetTransforms(sheet, layout, getTransform);
    expect(getTransform).toHaveBeenCalledWith('enrich');
  });
});
