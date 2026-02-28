import { describe, it, expect } from 'vitest';
import {
  cellStringFillEndTransform,
  FILL_END_TRANSFORM_ID,
  CellStringFillEndTransform,
  registerStringFillEndTransform,
} from './cell-string-fill-end-transform.js';

const cell = { key: 'x', value: 'ab', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringFillEndTransform', () => {
  it('should pad end to length with fill', () => {
    expect(cellStringFillEndTransform('ab', cell, row, { length: 5, fill: '0' })).toBe('ab000');
  });

  it('should return value when length 0', () => {
    expect(cellStringFillEndTransform('ab', cell, row, { length: 0 })).toBe('ab');
  });
});

describe('CellStringFillEndTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringFillEndTransform.id).toBe(FILL_END_TRANSFORM_ID);
    expect(CellStringFillEndTransform.Register()).toBe(FILL_END_TRANSFORM_ID);
  });
});

describe('registerStringFillEndTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringFillEndTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(FILL_END_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
