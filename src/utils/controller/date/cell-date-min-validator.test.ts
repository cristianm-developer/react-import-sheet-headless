import { describe, it, expect } from 'vitest';
import {
  cellDateMinValidator,
  CellDateMinValidator,
  DATE_MIN_VALIDATOR_ID,
} from './cell-date-min-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateMinValidator', () => {
  it('should return error when min param missing', () => {
    expect(cellDateMinValidator('2024-01-01', row, {})?.[0]?.code).toBe('DATE_MIN_INVALID_PARAMS');
  });

  it('should return error when value is before min', () => {
    expect(cellDateMinValidator('2020-01-01', row, { min: '2024-01-01' })?.[0]?.code).toBe(
      'DATE_MIN'
    );
  });

  it('should return null when value >= min', () => {
    expect(cellDateMinValidator('2024-06-01', row, { min: '2024-01-01' })).toBeNull();
  });
});

describe('CellDateMinValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateMinValidator.id).toBe(DATE_MIN_VALIDATOR_ID);
    expect(CellDateMinValidator.Register()).toBe(DATE_MIN_VALIDATOR_ID);
  });
});
