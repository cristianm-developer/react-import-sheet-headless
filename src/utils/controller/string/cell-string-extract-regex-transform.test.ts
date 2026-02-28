import { describe, it, expect } from 'vitest';
import {
  cellStringExtractByRegexTransform,
  EXTRACT_BY_REGEX_TRANSFORM_ID,
  CellStringExtractByRegexTransform,
  registerStringExtractByRegexTransform,
} from './cell-string-extract-regex-transform.js';

const cell = { key: 'x', value: 'a1b2', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringExtractByRegexTransform', () => {
  it('should extract first match', () => {
    expect(
      cellStringExtractByRegexTransform('hello 123 world', cell, row, {
        pattern: '\\d+',
        flags: 'g',
      })
    ).toBe('123');
  });

  it('should extract group when group param set', () => {
    expect(
      cellStringExtractByRegexTransform('foo-bar', cell, row, { pattern: '(foo)-(bar)', group: 1 })
    ).toBe('foo');
  });

  it('should return empty when no match', () => {
    expect(cellStringExtractByRegexTransform('abc', cell, row, { pattern: '\\d' })).toBe('');
  });

  it('should return full string when pattern empty', () => {
    expect(cellStringExtractByRegexTransform('hi', cell, row, { pattern: '' })).toBe('hi');
  });
});

describe('CellStringExtractByRegexTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringExtractByRegexTransform.id).toBe(EXTRACT_BY_REGEX_TRANSFORM_ID);
    expect(CellStringExtractByRegexTransform.Register()).toBe(EXTRACT_BY_REGEX_TRANSFORM_ID);
  });
});

describe('registerStringExtractByRegexTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerStringExtractByRegexTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(EXTRACT_BY_REGEX_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
