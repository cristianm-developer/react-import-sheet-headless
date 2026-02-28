import { describe, it, expect } from 'vitest';
import {
  cellStringPhoneValidator,
  CellStringPhoneValidator,
  STRING_PHONE_VALIDATOR_ID,
  registerStringPhoneValidator,
} from './cell-string-phone-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringPhoneValidator', () => {
  it('should return null for empty value', () => {
    expect(cellStringPhoneValidator('', row)).toBeNull();
    expect(cellStringPhoneValidator(null, row)).toBeNull();
  });

  it('should return error for too short or invalid', () => {
    expect(cellStringPhoneValidator('123', row)).toHaveLength(1);
    expect(cellStringPhoneValidator('abc', row)).toHaveLength(1);
  });

  it('should return null for valid phone', () => {
    expect(cellStringPhoneValidator('1234567', row)).toBeNull();
    expect(cellStringPhoneValidator('+1 234 567 8901', row)).toBeNull();
  });
});

describe('CellStringPhoneValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringPhoneValidator.id).toBe(STRING_PHONE_VALIDATOR_ID);
    expect(CellStringPhoneValidator.Register()).toBe(STRING_PHONE_VALIDATOR_ID);
  });

  it('should register with type cell when registerFn provided', () => {
    registerStringPhoneValidator((name, _fn, opts) => {
      expect(name).toBe(STRING_PHONE_VALIDATOR_ID);
      expect(opts.type).toBe('cell');
    });
  });
});
