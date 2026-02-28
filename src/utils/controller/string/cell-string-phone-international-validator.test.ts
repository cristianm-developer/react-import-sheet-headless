import { describe, it, expect } from 'vitest';
import {
  cellStringPhoneInternationalValidator,
  CellStringPhoneInternationalValidator,
  STRING_PHONE_INTERNATIONAL_VALIDATOR_ID,
} from './cell-string-phone-international-validator.js';

const row = { index: 0, cells: [] };

describe('cellStringPhoneInternationalValidator', () => {
  it('should return null for empty value', () => {
    expect(cellStringPhoneInternationalValidator('', row)).toBeNull();
  });

  it('should return error for too short or without country', () => {
    expect(cellStringPhoneInternationalValidator('123456', row)).toHaveLength(1);
    expect(cellStringPhoneInternationalValidator('0123456789', row)).toHaveLength(1);
  });

  it('should return null for valid international format', () => {
    expect(cellStringPhoneInternationalValidator('+1234567890', row)).toBeNull();
    expect(cellStringPhoneInternationalValidator('+44 20 7123 4567', row)).toBeNull();
  });
});

describe('CellStringPhoneInternationalValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringPhoneInternationalValidator.id).toBe(STRING_PHONE_INTERNATIONAL_VALIDATOR_ID);
    expect(CellStringPhoneInternationalValidator.Register()).toBe(
      STRING_PHONE_INTERNATIONAL_VALIDATOR_ID
    );
  });
});
