import { describe, it, expect } from 'vitest';
import {
  cellNumberPercentTransform,
  NUMBER_PERCENT_TRANSFORM_ID,
  CellNumberPercentTransform,
  registerNumberPercentTransform,
} from './cell-number-percent-transform.js';

const cell = { key: 'x', value: 25, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberPercentTransform', () => {
  it('should return (value / total) * 100', () => {
    expect(cellNumberPercentTransform(25, cell, row, { total: 100 })).toBe(25);
    expect(cellNumberPercentTransform(1, cell, row, { total: 4 })).toBe(25);
  });

  it('should return value unchanged when total is 0 or missing', () => {
    expect(cellNumberPercentTransform(25, cell, row, { total: 0 })).toBe(25);
    expect(cellNumberPercentTransform(25, cell, row)).toBe(25);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberPercentTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberPercentTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberPercentTransform.id).toBe(NUMBER_PERCENT_TRANSFORM_ID);
    expect(CellNumberPercentTransform.Register()).toBe(NUMBER_PERCENT_TRANSFORM_ID);
  });
});

describe('registerNumberPercentTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberPercentTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_PERCENT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
