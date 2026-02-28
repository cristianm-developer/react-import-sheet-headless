import { describe, it, expect } from 'vitest';
import {
  cellNumberNonPositiveValidator,
  CellNumberNonPositiveValidator,
  NUMBER_NON_POSITIVE_VALIDATOR_ID,
} from './cell-number-non-positive-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberNonPositiveValidator', () => {
  it('should return error for positive value', () => {
    expect(cellNumberNonPositiveValidator(1, row)).toEqual([
      { code: 'NUMBER_NON_POSITIVE', level: 'error', params: { value: 1 } },
    ]);
  });

  it('should return null for zero or negative', () => {
    expect(cellNumberNonPositiveValidator(0, row)).toBeNull();
    expect(cellNumberNonPositiveValidator(-1, row)).toBeNull();
  });
});

describe('CellNumberNonPositiveValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberNonPositiveValidator.id).toBe(NUMBER_NON_POSITIVE_VALIDATOR_ID);
    expect(CellNumberNonPositiveValidator.Register()).toBe(NUMBER_NON_POSITIVE_VALIDATOR_ID);
  });
});
