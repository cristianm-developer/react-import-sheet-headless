import { describe, it, expect } from 'vitest';
import {
  cellDateToTimeDateTransform,
  DATE_TO_TIME_DATE_TRANSFORM_ID,
  CellDateToTimeDateTransform,
  registerDateToTimeDateTransform,
} from './cell-date-to-time-date-transform.js';

const cell = { key: 'x', value: '2024-01-15', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateToTimeDateTransform', () => {
  it('should return datetime string YYYY-MM-DDTHH:mm:ss', () => {
    const d = new Date('2024-01-15T14:30:45');
    expect(cellDateToTimeDateTransform(d, cell, row)).toBe('2024-01-15T14:30:45');
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateToTimeDateTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateToTimeDateTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateToTimeDateTransform.id).toBe(DATE_TO_TIME_DATE_TRANSFORM_ID);
    expect(CellDateToTimeDateTransform.Register()).toBe(DATE_TO_TIME_DATE_TRANSFORM_ID);
  });
});

describe('registerDateToTimeDateTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateToTimeDateTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_TO_TIME_DATE_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
