import { describe, it, expect } from 'vitest';
import {
  cellStringEmailValidator,
  CellStringEmailValidator,
  STRING_EMAIL_VALIDATOR_ID,
  registerStringEmailValidator,
} from './cell-string-email-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringEmailValidator', () => {
  it('should return null for empty value', () => {
    expect(cellStringEmailValidator('', row)).toBeNull();
    expect(cellStringEmailValidator(null, row)).toBeNull();
  });

  it('should return error for invalid email', () => {
    expect(cellStringEmailValidator('notanemail', row)).toHaveLength(1);
    expect(cellStringEmailValidator('a@', row)).toHaveLength(1);
    expect(cellStringEmailValidator('@b.com', row)).toHaveLength(1);
  });

  it('should return null for valid email', () => {
    expect(cellStringEmailValidator('a@b.co', row)).toBeNull();
    expect(cellStringEmailValidator('user@example.com', row)).toBeNull();
  });
});

describe('CellStringEmailValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringEmailValidator.id).toBe(STRING_EMAIL_VALIDATOR_ID);
    expect(CellStringEmailValidator.Register()).toBe(STRING_EMAIL_VALIDATOR_ID);
  });
  it('should register with type cell', () => {
    registerStringEmailValidator((name, _, opts) => {
      expect(name).toBe(STRING_EMAIL_VALIDATOR_ID);
      expect(opts.type).toBe('cell');
    });
  });
});
