import { describe, it, expect } from 'vitest';
import {
  cellNumberIntegerValidator,
  CellNumberIntegerValidator,
  NUMBER_INTEGER_VALIDATOR_ID,
} from './cell-number-integer-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberIntegerValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellNumberIntegerValidator(null, row)).toBeNull();
    expect(cellNumberIntegerValidator('', row)).toBeNull();
  });

  it('should return error for non-integer', () => {
    expect(cellNumberIntegerValidator(1.5, row)).toHaveLength(1);
    expect(cellNumberIntegerValidator('3.14', row)).toHaveLength(1);
  });

  it('should return null for integer', () => {
    expect(cellNumberIntegerValidator(1, row)).toBeNull();
    expect(cellNumberIntegerValidator('42', row)).toBeNull();
  });
});

describe('CellNumberIntegerValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberIntegerValidator.id).toBe(NUMBER_INTEGER_VALIDATOR_ID);
    expect(CellNumberIntegerValidator.Register()).toBe(NUMBER_INTEGER_VALIDATOR_ID);
  });
});
