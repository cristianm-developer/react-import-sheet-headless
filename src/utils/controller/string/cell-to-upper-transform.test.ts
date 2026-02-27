import { describe, it, expect } from 'vitest';
import {
  cellToUpperTransform,
  TO_UPPER_TRANSFORM_ID,
  CellToUpperTransform,
  registerToUpperTransform,
} from './cell-to-upper-transform.js';

const cell = { key: 'name', value: 'hello', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellToUpperTransform', () => {
  it('should return uppercased string for string value', () => {
    expect(cellToUpperTransform('hello', cell, row)).toBe('HELLO');
  });

  it('should return value unchanged when not a string', () => {
    expect(cellToUpperTransform(42, cell, row)).toBe(42);
    expect(cellToUpperTransform(null, cell, row)).toBe(null);
  });
});

describe('CellToUpperTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellToUpperTransform.id).toBe(TO_UPPER_TRANSFORM_ID);
    expect(CellToUpperTransform.Register()).toBe(TO_UPPER_TRANSFORM_ID);
  });

  it('should call register when Register(registerFn) is passed', () => {
    const register = (name: string, fn: unknown, opts: { type: string }) => {
      expect(name).toBe(TO_UPPER_TRANSFORM_ID);
      expect(opts.type).toBe('cell');
      expect(typeof fn).toBe('function');
    };
    expect(CellToUpperTransform.Register(register)).toBe(TO_UPPER_TRANSFORM_ID);
  });
});

describe('registerToUpperTransform', () => {
  it('should register the transform with type cell', () => {
    const reg: { name?: string; fn?: unknown; type?: string } = {};
    registerToUpperTransform((name, fn, opts) => {
      reg.name = name;
      reg.fn = fn;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(TO_UPPER_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
    expect(reg.fn).toBe(cellToUpperTransform);
  });
});
