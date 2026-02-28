import { describe, it, expect } from 'vitest';
import {
  cellDateTimestampValidator,
  CellDateTimestampValidator,
  DATE_TIMESTAMP_VALIDATOR_ID,
} from './cell-date-timestamp-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateTimestampValidator', () => {
  it('should return null for null or empty', () => {
    expect(cellDateTimestampValidator(null, row)).toBeNull();
  });

  it('should return error for invalid timestamp', () => {
    expect(cellDateTimestampValidator('not-a-number', row)).toHaveLength(1);
  });

  it('should return null for valid timestamp', () => {
    expect(cellDateTimestampValidator(1705312800000, row)).toBeNull();
    expect(cellDateTimestampValidator('1705312800000', row)).toBeNull();
  });
});

describe('CellDateTimestampValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateTimestampValidator.id).toBe(DATE_TIMESTAMP_VALIDATOR_ID);
    expect(CellDateTimestampValidator.Register()).toBe(DATE_TIMESTAMP_VALIDATOR_ID);
  });
});
