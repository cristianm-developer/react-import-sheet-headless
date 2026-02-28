import { describe, it, expect } from 'vitest';
import {
  cellStringFillStartTransform,
  FILL_START_TRANSFORM_ID,
  CellStringFillStartTransform,
  registerStringFillStartTransform,
} from './cell-string-fill-start-transform.js';

const cell = { key: 'x', value: 'ab', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringFillStartTransform', () => {
  it('should pad start to length with fill', () => {
    expect(cellStringFillStartTransform('ab', cell, row, { length: 5, fill: '0' })).toBe('000ab');
  });

  it('should coerce non-string to string then pad', () => {
    expect(cellStringFillStartTransform(12, cell, row, { length: 4, fill: '0' })).toBe('0012');
  });

  it('should return value when length 0 or negative', () => {
    expect(cellStringFillStartTransform('ab', cell, row, { length: 0 })).toBe('ab');
  });
});

describe('CellStringFillStartTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringFillStartTransform.id).toBe(FILL_START_TRANSFORM_ID);
    expect(CellStringFillStartTransform.Register()).toBe(FILL_START_TRANSFORM_ID);
  });
});

describe('registerStringFillStartTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringFillStartTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(FILL_START_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
