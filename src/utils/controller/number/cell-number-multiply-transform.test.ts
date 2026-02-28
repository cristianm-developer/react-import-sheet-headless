import { describe, it, expect } from 'vitest';
import {
  cellNumberMultiplyTransform,
  NUMBER_MULTIPLY_TRANSFORM_ID,
  CellNumberMultiplyTransform,
  registerNumberMultiplyTransform,
} from './cell-number-multiply-transform.js';

const cell = { key: 'x', value: 4, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberMultiplyTransform', () => {
  it('should multiply by param value', () => {
    expect(cellNumberMultiplyTransform(4, cell, row, { value: 3 })).toBe(12);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberMultiplyTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberMultiplyTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberMultiplyTransform.id).toBe(NUMBER_MULTIPLY_TRANSFORM_ID);
    expect(CellNumberMultiplyTransform.Register()).toBe(NUMBER_MULTIPLY_TRANSFORM_ID);
  });
});

describe('registerNumberMultiplyTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberMultiplyTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_MULTIPLY_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
