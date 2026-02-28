import { describe, it, expect } from 'vitest';
import {
  cellNumberAddTransform,
  NUMBER_ADD_TRANSFORM_ID,
  CellNumberAddTransform,
  registerNumberAddTransform,
} from './cell-number-add-transform.js';

const cell = { key: 'x', value: 10, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberAddTransform', () => {
  it('should add param value to number', () => {
    expect(cellNumberAddTransform(10, cell, row, { value: 5 })).toBe(15);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberAddTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberAddTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberAddTransform.id).toBe(NUMBER_ADD_TRANSFORM_ID);
    expect(CellNumberAddTransform.Register()).toBe(NUMBER_ADD_TRANSFORM_ID);
  });
});

describe('registerNumberAddTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberAddTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_ADD_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
