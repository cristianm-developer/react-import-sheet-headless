import { describe, it, expect } from 'vitest';
import {
  cellDateLimitTransform,
  DATE_LIMIT_TRANSFORM_ID,
  CellDateLimitTransform,
  registerDateLimitTransform,
} from './cell-date-limit-transform.js';

const cell = { key: 'x', value: '2024-06-15', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateLimitTransform', () => {
  it('should clamp to min when date is before min', () => {
    const result = cellDateLimitTransform('2024-01-01', cell, row, {
      min: '2024-06-01',
      max: '2024-12-31',
    });
    expect(result).toContain('2024-06-01');
  });

  it('should clamp to max when date is after max', () => {
    const result = cellDateLimitTransform('2025-01-01', cell, row, {
      min: '2024-01-01',
      max: '2024-12-31',
    });
    expect(result).toContain('2024-12-31');
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateLimitTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateLimitTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateLimitTransform.id).toBe(DATE_LIMIT_TRANSFORM_ID);
    expect(CellDateLimitTransform.Register()).toBe(DATE_LIMIT_TRANSFORM_ID);
  });
});

describe('registerDateLimitTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateLimitTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_LIMIT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
