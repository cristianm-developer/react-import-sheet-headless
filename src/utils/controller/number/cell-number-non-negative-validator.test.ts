import { describe, it, expect } from 'vitest';
import {
  cellNumberNonNegativeValidator,
  CellNumberNonNegativeValidator,
  NUMBER_NON_NEGATIVE_VALIDATOR_ID,
} from './cell-number-non-negative-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberNonNegativeValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellNumberNonNegativeValidator(null, row)).toBeNull();
  });

  it('should return error for negative value', () => {
    expect(cellNumberNonNegativeValidator(-1, row)).toEqual([
      { code: 'NUMBER_NON_NEGATIVE', level: 'error', params: { value: -1 } },
    ]);
  });

  it('should return null for zero or positive', () => {
    expect(cellNumberNonNegativeValidator(0, row)).toBeNull();
    expect(cellNumberNonNegativeValidator(1, row)).toBeNull();
  });
});

describe('CellNumberNonNegativeValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberNonNegativeValidator.id).toBe(NUMBER_NON_NEGATIVE_VALIDATOR_ID);
    expect(CellNumberNonNegativeValidator.Register()).toBe(NUMBER_NON_NEGATIVE_VALIDATOR_ID);
  });
});
