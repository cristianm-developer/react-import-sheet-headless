import { describe, it, expect } from 'vitest';
import {
  cellNumberNonZeroValidator,
  CellNumberNonZeroValidator,
  NUMBER_NON_ZERO_VALIDATOR_ID,
} from './cell-number-non-zero-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberNonZeroValidator', () => {
  it('should return error for zero', () => {
    expect(cellNumberNonZeroValidator(0, row)).toEqual([
      { code: 'NUMBER_NON_ZERO', level: 'error', params: { value: 0 } },
    ]);
  });

  it('should return null for non-zero', () => {
    expect(cellNumberNonZeroValidator(1, row)).toBeNull();
    expect(cellNumberNonZeroValidator(-1, row)).toBeNull();
  });
});

describe('CellNumberNonZeroValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberNonZeroValidator.id).toBe(NUMBER_NON_ZERO_VALIDATOR_ID);
    expect(CellNumberNonZeroValidator.Register()).toBe(NUMBER_NON_ZERO_VALIDATOR_ID);
  });
});
