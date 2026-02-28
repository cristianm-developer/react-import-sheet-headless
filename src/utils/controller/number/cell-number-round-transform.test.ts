import { describe, it, expect } from 'vitest';
import {
  cellNumberRoundTransform,
  NUMBER_ROUND_TRANSFORM_ID,
  CellNumberRoundTransform,
  registerNumberRoundTransform,
} from './cell-number-round-transform.js';

const cell = { key: 'x', value: 3.7, errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellNumberRoundTransform', () => {
  it('should round with mode round by default', () => {
    expect(cellNumberRoundTransform(3.7, cell, row)).toBe(4);
  });

  it('should ceil with mode ceil', () => {
    expect(cellNumberRoundTransform(3.2, cell, row, { mode: 'ceil' })).toBe(4);
  });

  it('should floor with mode floor', () => {
    expect(cellNumberRoundTransform(3.9, cell, row, { mode: 'floor' })).toBe(3);
  });

  it('should return value unchanged when not a number', () => {
    expect(cellNumberRoundTransform('x', cell, row)).toBe('x');
  });
});

describe('CellNumberRoundTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellNumberRoundTransform.id).toBe(NUMBER_ROUND_TRANSFORM_ID);
    expect(CellNumberRoundTransform.Register()).toBe(NUMBER_ROUND_TRANSFORM_ID);
  });
});

describe('registerNumberRoundTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerNumberRoundTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(NUMBER_ROUND_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
