import { describe, it, expect } from 'vitest';
import {
  cellDateAddTransform,
  DATE_ADD_TRANSFORM_ID,
  CellDateAddTransform,
  registerDateAddTransform,
} from './cell-date-add-transform.js';

const cell = { key: 'x', value: '2024-01-15T12:00:00', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateAddTransform', () => {
  it('should add days', () => {
    const d = new Date('2024-01-15T12:00:00Z');
    const result = cellDateAddTransform(d, cell, row, { days: 10 });
    expect(String(result)).toContain('2024-01-25');
  });

  it('should add hours and minutes', () => {
    const d = new Date('2024-01-15T12:00:00Z');
    const result = cellDateAddTransform(d, cell, row, { hours: 2, minutes: 30 });
    expect(String(result)).toMatch(/14:30/);
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateAddTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateAddTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateAddTransform.id).toBe(DATE_ADD_TRANSFORM_ID);
    expect(CellDateAddTransform.Register()).toBe(DATE_ADD_TRANSFORM_ID);
  });
});

describe('registerDateAddTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateAddTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_ADD_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
