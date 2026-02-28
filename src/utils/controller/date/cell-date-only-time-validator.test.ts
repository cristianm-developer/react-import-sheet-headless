import { describe, it, expect } from 'vitest';
import {
  cellDateOnlyTimeValidator,
  CellDateOnlyTimeValidator,
  DATE_ONLY_TIME_VALIDATOR_ID,
} from './cell-date-only-time-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateOnlyTimeValidator', () => {
  it('should return null for null or empty', () => {
    expect(cellDateOnlyTimeValidator(null, row)).toBeNull();
  });

  it('should return error for invalid time', () => {
    expect(cellDateOnlyTimeValidator('25:00', row)).toHaveLength(1);
    expect(cellDateOnlyTimeValidator('not-time', row)).toHaveLength(1);
  });

  it('should return null for valid time', () => {
    expect(cellDateOnlyTimeValidator('14:30', row)).toBeNull();
    expect(cellDateOnlyTimeValidator('09:00:00', row)).toBeNull();
  });
});

describe('CellDateOnlyTimeValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateOnlyTimeValidator.id).toBe(DATE_ONLY_TIME_VALIDATOR_ID);
    expect(CellDateOnlyTimeValidator.Register()).toBe(DATE_ONLY_TIME_VALIDATOR_ID);
  });
});
