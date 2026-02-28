import { describe, it, expect } from 'vitest';
import {
  cellStringPhoneLocalValidator,
  CellStringPhoneLocalValidator,
  STRING_PHONE_LOCAL_VALIDATOR_ID,
} from './cell-string-phone-local-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringPhoneLocalValidator', () => {
  it('should return null for empty value', () => {
    expect(cellStringPhoneLocalValidator('', row)).toBeNull();
  });

  it('should return error for international-style with country code', () => {
    const r = cellStringPhoneLocalValidator('+12345678901', row);
    expect(r).toHaveLength(1);
    expect(r?.[0]?.params?.reason).toBe('international');
  });

  it('should return null for valid local length', () => {
    expect(cellStringPhoneLocalValidator('123456', row)).toBeNull();
    expect(cellStringPhoneLocalValidator('1234567890', row)).toBeNull();
  });
});

describe('CellStringPhoneLocalValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringPhoneLocalValidator.id).toBe(STRING_PHONE_LOCAL_VALIDATOR_ID);
    expect(CellStringPhoneLocalValidator.Register()).toBe(STRING_PHONE_LOCAL_VALIDATOR_ID);
  });
});
