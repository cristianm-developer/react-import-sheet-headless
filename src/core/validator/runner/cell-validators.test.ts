import { describe, it, expect } from 'vitest';
import { runCellValidators } from './cell-validators.js';

const row = { index: 0, cells: [{ key: 'email', value: 'x' }] };
const fieldWithValidators = {
  name: 'email',
  validators: ['required', 'email'] as const,
};

describe('runCellValidators', () => {
  it('should return empty array when field has no validators', () => {
    const result = runCellValidators(
      { key: 'x', value: 1 },
      row,
      { name: 'x' },
      () => undefined,
    );
    expect(result).toEqual([]);
  });

  it('should return empty array when getValidator returns undefined', () => {
    const result = runCellValidators(
      { key: 'email', value: 'a' },
      row,
      fieldWithValidators,
      () => undefined,
    );
    expect(result).toEqual([]);
  });

  it('should collect errors from validator and stop on fatal', () => {
    const errors = [{ code: 'REQUIRED', level: 'error' as const }];
    const getValidator = (name: string) =>
      name === 'required' ? () => errors : undefined;
    const result = runCellValidators(
      { key: 'email', value: '' },
      row,
      fieldWithValidators,
      getValidator,
    );
    expect(result).toEqual(errors);
  });

  it('should break on fatal and not run subsequent validators', () => {
    const fatal = [{ code: 'FATAL', level: 'fatal' as const }];
    let callCount = 0;
    const getValidator = () => {
      callCount++;
      return () => (callCount === 1 ? fatal : [{ code: 'OTHER', level: 'error' as const }]);
    };
    runCellValidators(
      { key: 'email', value: '' },
      row,
      { name: 'email', validators: ['a', 'b'] },
      getValidator,
    );
    expect(callCount).toBe(1);
  });
});
