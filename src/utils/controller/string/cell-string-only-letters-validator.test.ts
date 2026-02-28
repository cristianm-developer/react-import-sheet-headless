import { describe, it, expect } from 'vitest';
import {
  cellStringOnlyLettersValidator,
  CellStringOnlyLettersValidator,
  STRING_ONLY_LETTERS_VALIDATOR_ID,
} from './cell-string-only-letters-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringOnlyLettersValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellStringOnlyLettersValidator(null, row)).toBeNull();
    expect(cellStringOnlyLettersValidator('', row)).toBeNull();
  });

  it('should return error when value contains non-letters', () => {
    expect(cellStringOnlyLettersValidator('abc1', row)).toHaveLength(1);
    expect(cellStringOnlyLettersValidator('a b', row)).toHaveLength(1);
  });

  it('should return null when value is only letters', () => {
    expect(cellStringOnlyLettersValidator('abc', row)).toBeNull();
    expect(cellStringOnlyLettersValidator('ABC', row)).toBeNull();
  });

  it('should allow spaces when allowSpaces param is true', () => {
    expect(cellStringOnlyLettersValidator('a b', row, { allowSpaces: true })).toBeNull();
  });
});

describe('CellStringOnlyLettersValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringOnlyLettersValidator.id).toBe(STRING_ONLY_LETTERS_VALIDATOR_ID);
    expect(CellStringOnlyLettersValidator.Register()).toBe(STRING_ONLY_LETTERS_VALIDATOR_ID);
  });
});
