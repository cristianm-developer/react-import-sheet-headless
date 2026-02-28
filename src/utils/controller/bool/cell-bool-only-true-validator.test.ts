import { describe, it, expect } from 'vitest';
import {
  cellBoolOnlyTrueValidator,
  CellBoolOnlyTrueValidator,
  BOOL_ONLY_TRUE_VALIDATOR_ID,
} from './cell-bool-only-true-validator.js';

const row = { index: 0, cells: [] };

describe('cellBoolOnlyTrueValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellBoolOnlyTrueValidator(null, row)).toBeNull();
    expect(cellBoolOnlyTrueValidator('', row)).toBeNull();
  });

  it('should return error when value is not true', () => {
    expect(cellBoolOnlyTrueValidator(false, row)).toHaveLength(1);
    expect(cellBoolOnlyTrueValidator('false', row)).toHaveLength(1);
  });

  it('should return null for true-like values', () => {
    expect(cellBoolOnlyTrueValidator(true, row)).toBeNull();
    expect(cellBoolOnlyTrueValidator('true', row)).toBeNull();
    expect(cellBoolOnlyTrueValidator('yes', row)).toBeNull();
  });
});

describe('CellBoolOnlyTrueValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellBoolOnlyTrueValidator.id).toBe(BOOL_ONLY_TRUE_VALIDATOR_ID);
    expect(CellBoolOnlyTrueValidator.Register()).toBe(BOOL_ONLY_TRUE_VALIDATOR_ID);
  });
});
