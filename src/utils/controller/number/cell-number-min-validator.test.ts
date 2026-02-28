import { describe, it, expect } from 'vitest';
import {
  cellNumberMinValidator,
  CellNumberMinValidator,
  NUMBER_MIN_VALIDATOR_ID,
} from './cell-number-min-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberMinValidator', () => {
  it('should return error when min param missing or invalid', () => {
    expect(cellNumberMinValidator(5, row, {})?.[0]?.code).toBe('NUMBER_MIN_INVALID_PARAMS');
  });

  it('should return error when value is not a number', () => {
    expect(cellNumberMinValidator('x', row, { min: 0 })?.[0]?.code).toBe('NUMBER_MIN_NOT_A_NUMBER');
  });

  it('should return error when value < min', () => {
    expect(cellNumberMinValidator(2, row, { min: 5 })).toEqual([
      { code: 'NUMBER_MIN', level: 'error', params: { value: 2, min: 5 } },
    ]);
  });

  it('should return null when value >= min', () => {
    expect(cellNumberMinValidator(5, row, { min: 5 })).toBeNull();
    expect(cellNumberMinValidator(10, row, { min: 5 })).toBeNull();
  });
});

describe('CellNumberMinValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberMinValidator.id).toBe(NUMBER_MIN_VALIDATOR_ID);
    expect(CellNumberMinValidator.Register()).toBe(NUMBER_MIN_VALIDATOR_ID);
  });
});
