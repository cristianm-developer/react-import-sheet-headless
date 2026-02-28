import { describe, it, expect } from 'vitest';
import {
  cellDateUtcValidator,
  CellDateUtcValidator,
  DATE_UTC_VALIDATOR_ID,
} from './cell-date-utc-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateUtcValidator', () => {
  it('should return null for null or empty', () => {
    expect(cellDateUtcValidator(null, row)).toBeNull();
  });

  it('should return error when string has no UTC indicator', () => {
    expect(cellDateUtcValidator('2024-01-01T10:00:00', row)).toHaveLength(1);
  });

  it('should return null for UTC formats', () => {
    expect(cellDateUtcValidator('2024-01-01T10:00:00Z', row)).toBeNull();
    expect(cellDateUtcValidator(1705312800000, row)).toBeNull();
  });
});

describe('CellDateUtcValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateUtcValidator.id).toBe(DATE_UTC_VALIDATOR_ID);
    expect(CellDateUtcValidator.Register()).toBe(DATE_UTC_VALIDATOR_ID);
  });
});
