import { describe, it, expect } from 'vitest';
import {
  cellBoolOnlyFalseValidator,
  CellBoolOnlyFalseValidator,
  BOOL_ONLY_FALSE_VALIDATOR_ID,
} from './cell-bool-only-false-validator.js';

const row = { index: 0, cells: [] };

describe('cellBoolOnlyFalseValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellBoolOnlyFalseValidator(null, row)).toBeNull();
  });

  it('should return error when value is not false', () => {
    expect(cellBoolOnlyFalseValidator(true, row)).toHaveLength(1);
    expect(cellBoolOnlyFalseValidator('true', row)).toHaveLength(1);
  });

  it('should return null for false-like values', () => {
    expect(cellBoolOnlyFalseValidator(false, row)).toBeNull();
    expect(cellBoolOnlyFalseValidator('false', row)).toBeNull();
    expect(cellBoolOnlyFalseValidator('no', row)).toBeNull();
  });
});

describe('CellBoolOnlyFalseValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellBoolOnlyFalseValidator.id).toBe(BOOL_ONLY_FALSE_VALIDATOR_ID);
    expect(CellBoolOnlyFalseValidator.Register()).toBe(BOOL_ONLY_FALSE_VALIDATOR_ID);
  });
});
