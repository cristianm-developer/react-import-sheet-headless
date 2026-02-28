import { describe, it, expect } from 'vitest';
import {
  cellDateToUtcTransform,
  DATE_TO_UTC_TRANSFORM_ID,
  CellDateToUtcTransform,
  registerDateToUtcTransform,
} from './cell-date-to-utc-transform.js';

const cell = { key: 'x', value: '2024-01-15T12:00:00', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateToUtcTransform', () => {
  it('should return ISO UTC string', () => {
    const d = new Date('2024-01-15T12:00:00Z');
    expect(cellDateToUtcTransform(d, cell, row)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateToUtcTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateToUtcTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateToUtcTransform.id).toBe(DATE_TO_UTC_TRANSFORM_ID);
    expect(CellDateToUtcTransform.Register()).toBe(DATE_TO_UTC_TRANSFORM_ID);
  });
});

describe('registerDateToUtcTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateToUtcTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_TO_UTC_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
