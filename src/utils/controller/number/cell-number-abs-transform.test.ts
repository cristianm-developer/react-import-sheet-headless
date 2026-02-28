import { describe, it, expect } from 'vitest';
import {
  cellNumberAbsTransform,
  NUMBER_ABS_TRANSFORM_ID,
  CellNumberAbsTransform,
  registerNumberAbsTransform,
} from './cell-number-abs-transform.js';

const cell = { key: 'x', value: -5, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberAbsTransform', () => {
  it('should return absolute value', () => {
    expect(cellNumberAbsTransform(-5, cell, row)).toBe(5);
    expect(cellNumberAbsTransform(3, cell, row)).toBe(3);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberAbsTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberAbsTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberAbsTransform.id).toBe(NUMBER_ABS_TRANSFORM_ID);
    expect(CellNumberAbsTransform.Register()).toBe(NUMBER_ABS_TRANSFORM_ID);
  });
});

describe('registerNumberAbsTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberAbsTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_ABS_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
