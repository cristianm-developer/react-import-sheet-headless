import { describe, it, expect } from 'vitest';
import { runRowValidators } from './row-validators.js';

const row = { index: 0, cells: [{ key: 'a', value: 1 }] };
const layoutWithRowValidators = {
  name: 'test',
  version: '1',
  fields: {},
  rowValidators: ['unique'] as const,
};

describe('runRowValidators', () => {
  it('should return empty array when layout has no rowValidators', () => {
    const result = runRowValidators(
      row,
      { name: 'x', version: '1', fields: {} },
      () => undefined,
    );
    expect(result).toEqual([]);
  });

  it('should collect errors from row validator', () => {
    const errors = [{ code: 'DUPLICATE', level: 'error' as const }];
    const getValidator = () => () => errors;
    const result = runRowValidators(row, layoutWithRowValidators, getValidator);
    expect(result).toEqual(errors);
  });

  it('should break on fatal', () => {
    const fatal = [{ code: 'FATAL', level: 'fatal' as const }];
    let calls = 0;
    const getValidator = () => {
      calls++;
      return () => fatal;
    };
    runRowValidators(row, { ...layoutWithRowValidators, rowValidators: ['a', 'b'] }, getValidator);
    expect(calls).toBe(1);
  });
});
