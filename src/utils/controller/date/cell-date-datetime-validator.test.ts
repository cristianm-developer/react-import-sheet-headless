import { describe, it, expect } from 'vitest';
import {
  cellDateDatetimeValidator,
  CellDateDatetimeValidator,
  DATE_DATETIME_VALIDATOR_ID,
} from './cell-date-datetime-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateDatetimeValidator', () => {
  it('should return null for null or empty', () => {
    expect(cellDateDatetimeValidator(null, row)).toBeNull();
  });

  it('should return error for invalid datetime', () => {
    expect(cellDateDatetimeValidator('not-a-date', row)).toHaveLength(1);
  });

  it('should return null for valid datetime', () => {
    expect(cellDateDatetimeValidator('2024-01-15T10:00:00', row)).toBeNull();
    expect(cellDateDatetimeValidator(new Date(), row)).toBeNull();
  });
});

describe('CellDateDatetimeValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateDatetimeValidator.id).toBe(DATE_DATETIME_VALIDATOR_ID);
    expect(CellDateDatetimeValidator.Register()).toBe(DATE_DATETIME_VALIDATOR_ID);
  });
});
