import { describe, it, expect } from 'vitest';
import {
  cellDateMaxValidator,
  CellDateMaxValidator,
  DATE_MAX_VALIDATOR_ID,
} from './cell-date-max-validator.js';

const row = { index: 0, cells: [] };

describe('cellDateMaxValidator', () => {
  it('should return error when value is after max', () => {
    expect(cellDateMaxValidator('2030-01-01', row, { max: '2024-01-01' })?.[0]?.code).toBe(
      'DATE_MAX'
    );
  });

  it('should return null when value <= max', () => {
    expect(cellDateMaxValidator('2024-01-01', row, { max: '2024-12-31' })).toBeNull();
  });
});

describe('CellDateMaxValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellDateMaxValidator.id).toBe(DATE_MAX_VALIDATOR_ID);
    expect(CellDateMaxValidator.Register()).toBe(DATE_MAX_VALIDATOR_ID);
  });
});
