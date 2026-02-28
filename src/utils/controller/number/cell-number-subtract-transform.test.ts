import { describe, it, expect } from 'vitest';
import {
  cellNumberSubtractTransform,
  NUMBER_SUBTRACT_TRANSFORM_ID,
  CellNumberSubtractTransform,
  registerNumberSubtractTransform,
} from './cell-number-subtract-transform.js';

const cell = { key: 'x', value: 10, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberSubtractTransform', () => {
  it('should subtract param value from number', () => {
    expect(cellNumberSubtractTransform(10, cell, row, { value: 3 })).toBe(7);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberSubtractTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberSubtractTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberSubtractTransform.id).toBe(NUMBER_SUBTRACT_TRANSFORM_ID);
    expect(CellNumberSubtractTransform.Register()).toBe(NUMBER_SUBTRACT_TRANSFORM_ID);
  });
});

describe('registerNumberSubtractTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberSubtractTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_SUBTRACT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
