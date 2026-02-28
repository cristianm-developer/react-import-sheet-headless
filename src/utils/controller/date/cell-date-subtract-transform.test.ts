import { describe, it, expect } from 'vitest';
import {
  cellDateSubtractTransform,
  DATE_SUBTRACT_TRANSFORM_ID,
  CellDateSubtractTransform,
  registerDateSubtractTransform,
} from './cell-date-subtract-transform.js';

const cell = { key: 'x', value: '2024-01-25T12:00:00', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateSubtractTransform', () => {
  it('should subtract days', () => {
    const d = new Date('2024-01-25T12:00:00Z');
    const result = cellDateSubtractTransform(d, cell, row, { days: 10 });
    expect(String(result)).toContain('2024-01-15');
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateSubtractTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateSubtractTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateSubtractTransform.id).toBe(DATE_SUBTRACT_TRANSFORM_ID);
    expect(CellDateSubtractTransform.Register()).toBe(DATE_SUBTRACT_TRANSFORM_ID);
  });
});

describe('registerDateSubtractTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateSubtractTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_SUBTRACT_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
