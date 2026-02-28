import { describe, it, expect } from 'vitest';
import {
  cellStringByregexValidator,
  CellStringByregexValidator,
  STRING_BYREGEX_VALIDATOR_ID,
  registerStringByregexValidator,
} from './cell-string-byregex-validator.js';

const row = { index: 0, cells: [{ key: 'a', value: 'x' }] };

describe('cellStringByregexValidator', () => {
  it('should return error when pattern is missing', () => {
    expect(cellStringByregexValidator('abc', row, {})).toHaveLength(1);
    expect(cellStringByregexValidator('abc', row, {})?.[0]?.code).toBe(
      'STRING_BYREGEX_INVALID_PARAMS'
    );
  });

  it('should return error when value does not match pattern', () => {
    expect(cellStringByregexValidator('abc', row, { pattern: '^[0-9]+$' })).toEqual([
      {
        code: 'STRING_BYREGEX_MISMATCH',
        level: 'error',
        params: { value: 'abc', pattern: '^[0-9]+$' },
      },
    ]);
  });

  it('should return null when value matches pattern', () => {
    expect(cellStringByregexValidator('123', row, { pattern: '^[0-9]+$' })).toBeNull();
    expect(cellStringByregexValidator('a', row, { pattern: '^a$' })).toBeNull();
  });

  it('should return error for invalid regex pattern', () => {
    const r = cellStringByregexValidator('x', row, { pattern: '[' });
    expect(r).toHaveLength(1);
    expect(r?.[0]?.code).toBe('STRING_BYREGEX_INVALID_PATTERN');
  });
});

describe('CellStringByregexValidator', () => {
  it('should have id and Register returns id', () => {
    expect(CellStringByregexValidator.id).toBe(STRING_BYREGEX_VALIDATOR_ID);
    expect(CellStringByregexValidator.Register()).toBe(STRING_BYREGEX_VALIDATOR_ID);
  });

  it('should register with type cell when registerFn provided', () => {
    registerStringByregexValidator((name, fn, opts) => {
      expect(name).toBe(STRING_BYREGEX_VALIDATOR_ID);
      expect(opts.type).toBe('cell');
    });
  });
});
