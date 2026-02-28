import { describe, it, expect } from 'vitest';
import {
  cellNumberDivideTransform,
  NUMBER_DIVIDE_TRANSFORM_ID,
  CellNumberDivideTransform,
  registerNumberDivideTransform,
} from './cell-number-divide-transform.js';

const cell = { key: 'x', value: 10, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberDivideTransform', () => {
  it('should divide by param value', () => {
    expect(cellNumberDivideTransform(10, cell, row, { value: 2 })).toBe(5);
  });

  it('should return value unchanged when divisor is 0', () => {
    expect(cellNumberDivideTransform(10, cell, row, { value: 0 })).toBe(10);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberDivideTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberDivideTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberDivideTransform.id).toBe(NUMBER_DIVIDE_TRANSFORM_ID);
    expect(CellNumberDivideTransform.Register()).toBe(NUMBER_DIVIDE_TRANSFORM_ID);
  });
});

describe('registerNumberDivideTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberDivideTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_DIVIDE_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
