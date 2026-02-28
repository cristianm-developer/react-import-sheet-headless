import { describe, it, expect } from 'vitest';
import {
  cellNumberLimitTransform,
  NUMBER_LIMIT_TRANSFORM_ID,
  CellNumberLimitTransform,
  registerNumberLimitTransform,
} from './cell-number-limit-transform.js';

const cell = { key: 'x', value: 50, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberLimitTransform', () => {
  it('should clamp to min when below min', () => {
    expect(cellNumberLimitTransform(5, cell, row, { min: 10 })).toBe(10);
  });

  it('should clamp to max when above max', () => {
    expect(cellNumberLimitTransform(150, cell, row, { max: 100 })).toBe(100);
  });

  it('should clamp to both min and max', () => {
    expect(cellNumberLimitTransform(5, cell, row, { min: 10, max: 100 })).toBe(10);
    expect(cellNumberLimitTransform(150, cell, row, { min: 10, max: 100 })).toBe(100);
    expect(cellNumberLimitTransform(50, cell, row, { min: 10, max: 100 })).toBe(50);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberLimitTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberLimitTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberLimitTransform.id).toBe(NUMBER_LIMIT_TRANSFORM_ID);
    expect(CellNumberLimitTransform.Register()).toBe(NUMBER_LIMIT_TRANSFORM_ID);
  });
});

describe('registerNumberLimitTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberLimitTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_LIMIT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
