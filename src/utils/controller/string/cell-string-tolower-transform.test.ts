import { describe, it, expect } from 'vitest';
import {
  cellStringToLowerTransform,
  TO_LOWER_TRANSFORM_ID,
  CellStringToLowerTransform,
  registerStringToLowerTransform,
} from './cell-string-tolower-transform.js';

const cell = { key: 'x', value: 'HELLO', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellStringToLowerTransform', () => {
  it('should return lowercased string for string value', () => {
    expect(cellStringToLowerTransform('HELLO', cell, row)).toBe('hello');
  });

  it('should return value unchanged when not a string', () => {
    expect(cellStringToLowerTransform(42, cell, row)).toBe(42);
    expect(cellStringToLowerTransform(null, cell, row)).toBe(null);
  });
});

describe('CellStringToLowerTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellStringToLowerTransform.id).toBe(TO_LOWER_TRANSFORM_ID);
    expect(CellStringToLowerTransform.Register()).toBe(TO_LOWER_TRANSFORM_ID);
  });

  it('should call register when Register(registerFn) is passed', () => {
    const register = (name: string, fn: unknown, opts: { type: string }) => {
      expect(name).toBe(TO_LOWER_TRANSFORM_ID);
      expect(opts.type).toBe('cell');
      expect(typeof fn).toBe('function');
    };
    expect(CellStringToLowerTransform.Register(register)).toBe(TO_LOWER_TRANSFORM_ID);
  });
});

describe('registerStringToLowerTransform', () => {
  it('should register the transform with type cell', () => {
    const reg: { name?: string; fn?: unknown; type?: string } = {};
    registerStringToLowerTransform((name, fn, opts) => {
      reg.name = name;
      reg.fn = fn;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(TO_LOWER_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
    expect(reg.fn).toBe(cellStringToLowerTransform);
  });
});
