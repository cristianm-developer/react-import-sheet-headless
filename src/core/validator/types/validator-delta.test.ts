import { describe, it, expect } from 'vitest';
import {
  isValidatorErrorCell,
  isValidatorErrorRow,
  isValidatorErrorSheet,
} from './validator-delta.js';

describe('validator delta type guards', () => {
  it('should identify cell errors', () => {
    const item = { rowIndex: 0, cellKey: 'a', error: { code: 'X' } };
    expect(isValidatorErrorCell(item)).toBe(true);
    expect(isValidatorErrorRow(item)).toBe(false);
    expect(isValidatorErrorSheet(item)).toBe(false);
  });

  it('should identify row errors', () => {
    const item = { rowIndex: 0, error: { code: 'X' } };
    expect(isValidatorErrorCell(item)).toBe(false);
    expect(isValidatorErrorRow(item)).toBe(true);
    expect(isValidatorErrorSheet(item)).toBe(false);
  });

  it('should identify sheet errors', () => {
    const item = { error: { code: 'X' } };
    expect(isValidatorErrorCell(item)).toBe(false);
    expect(isValidatorErrorRow(item)).toBe(false);
    expect(isValidatorErrorSheet(item)).toBe(true);
  });
});
