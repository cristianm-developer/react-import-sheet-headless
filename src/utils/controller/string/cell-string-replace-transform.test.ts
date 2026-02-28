import { describe, it, expect } from 'vitest';
import {
  cellStringReplaceTransform,
  REPLACE_STR_TRANSFORM_ID,
  CellStringReplaceTransform,
  registerStringReplaceTransform,
} from './cell-string-replace-transform.js';

const cell = { key: 'x', value: 'a-b-c', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringReplaceTransform', () => {
  it('should replace search with replacement', () => {
    expect(cellStringReplaceTransform('hello', cell, row, { search: 'l', replacement: 'x' })).toBe(
      'hexxo'
    );
  });

  it('should return value unchanged when not a string', () => {
    expect(cellStringReplaceTransform(42, cell, row)).toBe(42);
  });

  it('should use empty strings when params missing', () => {
    expect(cellStringReplaceTransform('hi', cell, row)).toBe('hi');
  });
});

describe('CellStringReplaceTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringReplaceTransform.id).toBe(REPLACE_STR_TRANSFORM_ID);
    expect(CellStringReplaceTransform.Register()).toBe(REPLACE_STR_TRANSFORM_ID);
  });
});

describe('registerStringReplaceTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringReplaceTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(REPLACE_STR_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
