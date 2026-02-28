import { describe, it, expect } from 'vitest';
import {
  cellStringSliceTransform,
  SLICE_TRANSFORM_ID,
  CellStringSliceTransform,
  registerStringSliceTransform,
} from './cell-string-slice-transform.js';

const cell = { key: 'x', value: 'hello', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringSliceTransform', () => {
  it('should slice string with start and end', () => {
    expect(cellStringSliceTransform('hello', cell, row, { start: 1, end: 4 })).toBe('ell');
  });

  it('should slice with start only', () => {
    expect(cellStringSliceTransform('hello', cell, row, { start: 2 })).toBe('llo');
  });

  it('should return value unchanged when not a string', () => {
    expect(cellStringSliceTransform(42, cell, row)).toBe(42);
  });

  it('should return full string when no valid params', () => {
    expect(cellStringSliceTransform('hello', cell, row)).toBe('hello');
  });
});

describe('CellStringSliceTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringSliceTransform.id).toBe(SLICE_TRANSFORM_ID);
    expect(CellStringSliceTransform.Register()).toBe(SLICE_TRANSFORM_ID);
  });
});

describe('registerStringSliceTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringSliceTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(SLICE_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
