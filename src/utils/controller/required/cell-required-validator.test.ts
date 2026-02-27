import { describe, it, expect } from 'vitest';
import {
  cellRequiredValidator,
  CellRequiredValidator,
  REQUIRED_VALIDATOR_ID,
  registerRequiredValidator,
} from './cell-required-validator.js';

const row = { index: 0, cells: [{ key: 'a', value: 1 }] };

describe('cellRequiredValidator', () => {
  it('should return error when value is null or undefined', () => {
    expect(cellRequiredValidator(null, row)).toEqual([
      { code: 'REQUIRED', level: 'error', params: { value: null } },
    ]);
    expect(cellRequiredValidator(undefined, row)).toEqual([
      { code: 'REQUIRED', level: 'error', params: { value: undefined } },
    ]);
  });

  it('should return error when value is empty string or whitespace', () => {
    expect(cellRequiredValidator('', row)).toEqual([
      { code: 'REQUIRED', level: 'error', params: { value: '' } },
    ]);
    expect(cellRequiredValidator('  ', row)).toEqual([
      { code: 'REQUIRED', level: 'error', params: { value: '  ' } },
    ]);
  });

  it('should return null when value is non-empty', () => {
    expect(cellRequiredValidator(0, row)).toBeNull();
    expect(cellRequiredValidator('ok', row)).toBeNull();
    expect(cellRequiredValidator(false, row)).toBeNull();
  });
});

describe('CellRequiredValidator', () => {
  it('should have id and validate', () => {
    expect(CellRequiredValidator.id).toBe(REQUIRED_VALIDATOR_ID);
    expect(CellRequiredValidator.validate(null, row)).toHaveLength(1);
  });

  it('should return id from Register without registerFn', () => {
    expect(CellRequiredValidator.Register()).toBe('required');
  });

  it('should call registerFn when provided', () => {
    const register = (name: string, fn: unknown, opts: { type: string }) => {
      expect(name).toBe('required');
      expect(typeof fn).toBe('function');
      expect(opts.type).toBe('cell');
    };
    expect(CellRequiredValidator.Register(register)).toBe('required');
  });
});

describe('registerRequiredValidator', () => {
  it('should register with type cell', () => {
    const calls: unknown[] = [];
    registerRequiredValidator((name, fn, opts) => {
      calls.push({ name, fn, opts });
    });
    expect(calls).toHaveLength(1);
    expect((calls[0] as { opts: { type: string } }).opts.type).toBe('cell');
  });
});
