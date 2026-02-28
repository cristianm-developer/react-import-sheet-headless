import { describe, it, expect } from 'vitest';
import {
  cellDateOnlyYearValidator,
  CellDateOnlyYearValidator,
  DATE_ONLY_YEAR_VALIDATOR_ID,
} from './cell-date-only-year-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateOnlyYearValidator', () => {
  it('should return null for null or empty', () => {
    expect(cellDateOnlyYearValidator(null, row)).toBeNull();
    expect(cellDateOnlyYearValidator('', row)).toBeNull();
  });

  it('should return error for invalid year', () => {
    expect(cellDateOnlyYearValidator('1899', row)).toHaveLength(1);
    expect(cellDateOnlyYearValidator('abc', row)).toHaveLength(1);
  });

  it('should return null for valid year', () => {
    expect(cellDateOnlyYearValidator('2024', row)).toBeNull();
    expect(cellDateOnlyYearValidator(1990, row)).toBeNull();
  });
});

describe('CellDateOnlyYearValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateOnlyYearValidator.id).toBe(DATE_ONLY_YEAR_VALIDATOR_ID);
    expect(CellDateOnlyYearValidator.Register()).toBe(DATE_ONLY_YEAR_VALIDATOR_ID);
  });
});
