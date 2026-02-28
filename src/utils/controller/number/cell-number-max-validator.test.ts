import { describe, it, expect } from 'vitest';
import {
  cellNumberMaxValidator,
  CellNumberMaxValidator,
  NUMBER_MAX_VALIDATOR_ID,
} from './cell-number-max-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberMaxValidator', () => {
  it('should return error when max param missing', () => {
    expect(cellNumberMaxValidator(5, row, {})?.[0]?.code).toBe('NUMBER_MAX_INVALID_PARAMS');
  });

  it('should return error when value > max', () => {
    expect(cellNumberMaxValidator(10, row, { max: 5 })).toEqual([
      { code: 'NUMBER_MAX', level: 'error', params: { value: 10, max: 5 } },
    ]);
  });

  it('should return null when value <= max', () => {
    expect(cellNumberMaxValidator(5, row, { max: 5 })).toBeNull();
    expect(cellNumberMaxValidator(3, row, { max: 5 })).toBeNull();
  });
});

describe('CellNumberMaxValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberMaxValidator.id).toBe(NUMBER_MAX_VALIDATOR_ID);
    expect(CellNumberMaxValidator.Register()).toBe(NUMBER_MAX_VALIDATOR_ID);
  });
});
