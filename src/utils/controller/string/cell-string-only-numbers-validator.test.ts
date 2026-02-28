import { describe, it, expect } from 'vitest';
import {
  cellStringOnlyNumbersValidator,
  CellStringOnlyNumbersValidator,
  STRING_ONLY_NUMBERS_VALIDATOR_ID,
} from './cell-string-only-numbers-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringOnlyNumbersValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellStringOnlyNumbersValidator(null, row)).toBeNull();
    expect(cellStringOnlyNumbersValidator(undefined, row)).toBeNull();
    expect(cellStringOnlyNumbersValidator('', row)).toBeNull();
  });

  it('should return error when value contains non-digits', () => {
    expect(cellStringOnlyNumbersValidator('12a', row)).toEqual([
      { code: 'STRING_ONLY_NUMBERS_INVALID', level: 'error', params: { value: '12a' } },
    ]);
    expect(cellStringOnlyNumbersValidator('1.5', row)).toHaveLength(1);
  });

  it('should return null when value is only digits', () => {
    expect(cellStringOnlyNumbersValidator('123', row)).toBeNull();
    expect(cellStringOnlyNumbersValidator('0', row)).toBeNull();
  });
});

describe('CellStringOnlyNumbersValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringOnlyNumbersValidator.id).toBe(STRING_ONLY_NUMBERS_VALIDATOR_ID);
    expect(CellStringOnlyNumbersValidator.Register()).toBe(STRING_ONLY_NUMBERS_VALIDATOR_ID);
  });
});
