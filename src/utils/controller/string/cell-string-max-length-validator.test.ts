import { describe, it, expect } from 'vitest';
import {
  cellStringMaxLengthValidator,
  CellStringMaxLengthValidator,
  STRING_MAX_LENGTH_VALIDATOR_ID,
  registerStringMaxLengthValidator,
} from './cell-string-max-length-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringMaxLengthValidator', () => {
  it('should return error when params missing or invalid maxLength', () => {
    expect(cellStringMaxLengthValidator('x', row, {})?.[0]?.code).toBe(
      'STRING_MAX_LENGTH_INVALID_PARAMS'
    );
    expect(cellStringMaxLengthValidator('x', row, { maxLength: -1 })?.[0]?.code).toBe(
      'STRING_MAX_LENGTH_INVALID_PARAMS'
    );
  });

  it('should return error when string exceeds maxLength', () => {
    expect(cellStringMaxLengthValidator('hello', row, { maxLength: 3 })).toEqual([
      {
        code: 'STRING_MAX_LENGTH',
        level: 'error',
        params: { value: 'hello', maxLength: 3, length: 5 },
      },
    ]);
  });

  it('should return null when length <= maxLength', () => {
    expect(cellStringMaxLengthValidator('hi', row, { maxLength: 5 })).toBeNull();
    expect(cellStringMaxLengthValidator('', row, { maxLength: 0 })).toBeNull();
  });
});

describe('CellStringMaxLengthValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringMaxLengthValidator.id).toBe(STRING_MAX_LENGTH_VALIDATOR_ID);
    expect(CellStringMaxLengthValidator.Register()).toBe(STRING_MAX_LENGTH_VALIDATOR_ID);
  });

  it('should register with type cell', () => {
    registerStringMaxLengthValidator((name, _, opts) => {
      expect(name).toBe(STRING_MAX_LENGTH_VALIDATOR_ID);
      expect(opts.type).toBe('cell');
    });
  });
});
