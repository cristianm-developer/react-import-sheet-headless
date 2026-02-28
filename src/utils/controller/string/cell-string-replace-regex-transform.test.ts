import { describe, it, expect } from 'vitest';
import {
  cellStringReplaceByRegexTransform,
  REPLACE_BY_REGEX_TRANSFORM_ID,
  CellStringReplaceByRegexTransform,
  registerStringReplaceByRegexTransform,
} from './cell-string-replace-regex-transform.js';

const cell = { key: 'x', value: 'a1b2', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringReplaceByRegexTransform', () => {
  it('should replace using regex', () => {
    expect(
      cellStringReplaceByRegexTransform('a1b2', cell, row, {
        pattern: '\\d',
        flags: 'g',
        replacement: 'X',
      })
    ).toBe('aXbX');
  });

  it('should return value unchanged when not a string', () => {
    expect(cellStringReplaceByRegexTransform(42, cell, row)).toBe(42);
  });

  it('should return value when pattern empty', () => {
    expect(cellStringReplaceByRegexTransform('hi', cell, row, { pattern: '' })).toBe('hi');
  });

  it('should return value on invalid regex', () => {
    expect(cellStringReplaceByRegexTransform('hi', cell, row, { pattern: '[' })).toBe('hi');
  });
});

describe('CellStringReplaceByRegexTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringReplaceByRegexTransform.id).toBe(REPLACE_BY_REGEX_TRANSFORM_ID);
    expect(CellStringReplaceByRegexTransform.Register()).toBe(REPLACE_BY_REGEX_TRANSFORM_ID);
  });
});

describe('registerStringReplaceByRegexTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringReplaceByRegexTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(REPLACE_BY_REGEX_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
