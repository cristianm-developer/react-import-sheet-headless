import { describe, it, expect } from 'vitest';
import { runTableValidation, EXTERNAL_VALIDATION_FAILED } from './run-table-validation.js';

const sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  rows: [{ index: 0, cells: [{ key: 'a', value: 1 }] }],
};
const layout = { name: 'l', version: '1', fields: {}, sheetValidators: ['integrity'] };

describe('runTableValidation', () => {
  it('should return empty array when no sheetValidators', async () => {
    const result = await runTableValidation(
      sheet,
      { name: 'l', version: '1', fields: {} },
      () => undefined,
    );
    expect(result).toEqual([]);
  });

  it('should return sheet-level errors from sync validator', async () => {
    const errors = [{ code: 'DUPLICATE_IDS', level: 'error' as const }];
    const getValidator = () => () => errors;
    const result = await runTableValidation(sheet, layout, getValidator);
    expect(result).toEqual([{ error: errors[0] }]);
  });

  it('should return EXTERNAL_VALIDATION_FAILED when validator throws', async () => {
    const getValidator = () => () => {
      throw new Error('network');
    };
    const result = await runTableValidation(sheet, layout, getValidator);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('error');
    expect((result[0] as { error: { code: string } }).error.code).toBe(
      EXTERNAL_VALIDATION_FAILED,
    );
  });

  it('should support async validator', async () => {
    const errors = [{ code: 'ASYNC_ERR', level: 'warning' as const }];
    const getValidator = () => async () => errors;
    const result = await runTableValidation(sheet, layout, getValidator);
    expect(result).toEqual([{ error: errors[0] }]);
  });
});
