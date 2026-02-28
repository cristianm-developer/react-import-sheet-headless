import { describe, it, expect } from 'vitest';
import {
  cellDateToOnlyTimeTransform,
  DATE_TO_ONLY_TIME_TRANSFORM_ID,
  CellDateToOnlyTimeTransform,
  registerDateToOnlyTimeTransform,
} from './cell-date-to-only-time-transform.js';

const cell = { key: 'x', value: '2024-01-15T14:30:00', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateToOnlyTimeTransform', () => {
  it('should return time string HH:mm:ss', () => {
    const d = new Date('2024-01-15T14:30:45');
    expect(cellDateToOnlyTimeTransform(d, cell, row)).toBe('14:30:45');
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateToOnlyTimeTransform('not-a-date', cell, row)).toBe('not-a-date');
  });
});

describe('CellDateToOnlyTimeTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateToOnlyTimeTransform.id).toBe(DATE_TO_ONLY_TIME_TRANSFORM_ID);
    expect(CellDateToOnlyTimeTransform.Register()).toBe(DATE_TO_ONLY_TIME_TRANSFORM_ID);
  });
});

describe('registerDateToOnlyTimeTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateToOnlyTimeTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_TO_ONLY_TIME_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
