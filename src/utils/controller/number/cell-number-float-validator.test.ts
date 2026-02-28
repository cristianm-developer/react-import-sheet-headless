import { describe, it, expect } from 'vitest';
import {
  cellNumberFloatValidator,
  CellNumberFloatValidator,
  NUMBER_FLOAT_VALIDATOR_ID,
} from './cell-number-float-validator.js';

const row = { index: 0, cells: [] };

describe('cellNumberFloatValidator', () => {
  it('should return null for null, undefined or empty', () => {
    expect(cellNumberFloatValidator(null, row)).toBeNull();
    expect(cellNumberFloatValidator('', row)).toBeNull();
  });

  it('should return error for non-numeric value', () => {
    expect(cellNumberFloatValidator('abc', row)).toHaveLength(1);
    expect(cellNumberFloatValidator('nope', row)).toHaveLength(1);
  });

  it('should return null for valid float', () => {
    expect(cellNumberFloatValidator(1.5, row)).toBeNull();
    expect(cellNumberFloatValidator('3.14', row)).toBeNull();
  });
});

describe('CellNumberFloatValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellNumberFloatValidator.id).toBe(NUMBER_FLOAT_VALIDATOR_ID);
    expect(CellNumberFloatValidator.Register()).toBe(NUMBER_FLOAT_VALIDATOR_ID);
  });
});
