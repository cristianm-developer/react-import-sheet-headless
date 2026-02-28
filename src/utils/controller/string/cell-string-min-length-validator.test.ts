import { describe, it, expect } from 'vitest';
import {
  cellStringMinLengthValidator,
  CellStringMinLengthValidator,
  STRING_MIN_LENGTH_VALIDATOR_ID,
  registerStringMinLengthValidator,
} from './cell-string-min-length-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringMinLengthValidator', () => {
  it('should return error when params missing or invalid minLength', () => {
    expect(cellStringMinLengthValidator('x', row, {})?.[0]?.code).toBe(
      'STRING_MIN_LENGTH_INVALID_PARAMS'
    );
    expect(cellStringMinLengthValidator('x', row, { minLength: -1 })?.[0]?.code).toBe(
      'STRING_MIN_LENGTH_INVALID_PARAMS'
    );
  });

  it('should return error when string shorter than minLength', () => {
    expect(cellStringMinLengthValidator('hi', row, { minLength: 5 })).toEqual([
      {
        code: 'STRING_MIN_LENGTH',
        level: 'error',
        params: { value: 'hi', minLength: 5, length: 2 },
      },
    ]);
  });

  it('should return null when length >= minLength', () => {
    expect(cellStringMinLengthValidator('hello', row, { minLength: 3 })).toBeNull();
    expect(cellStringMinLengthValidator('ab', row, { minLength: 2 })).toBeNull();
  });
});

describe('CellStringMinLengthValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringMinLengthValidator.id).toBe(STRING_MIN_LENGTH_VALIDATOR_ID);
    expect(CellStringMinLengthValidator.Register()).toBe(STRING_MIN_LENGTH_VALIDATOR_ID);
  });
  it('should register with type cell', () => {
    registerStringMinLengthValidator((name, _, opts) => {
      expect(name).toBe(STRING_MIN_LENGTH_VALIDATOR_ID);
      expect(opts.type).toBe('cell');
    });
  });
});
