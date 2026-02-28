import { describe, it, expect } from 'vitest';
import {
  cellNumberSqrtTransform,
  NUMBER_SQRT_TRANSFORM_ID,
  CellNumberSqrtTransform,
  registerNumberSqrtTransform,
} from './cell-number-sqrt-transform.js';

const cell = { key: 'x', value: 9, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberSqrtTransform', () => {
  it('should return square root', () => {
    expect(cellNumberSqrtTransform(9, cell, row)).toBe(3);
  });

  it('should return value unchanged when negative', () => {
    expect(cellNumberSqrtTransform(-4, cell, row)).toBe(-4);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberSqrtTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberSqrtTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberSqrtTransform.id).toBe(NUMBER_SQRT_TRANSFORM_ID);
    expect(CellNumberSqrtTransform.Register()).toBe(NUMBER_SQRT_TRANSFORM_ID);
  });
});

describe('registerNumberSqrtTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberSqrtTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_SQRT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
