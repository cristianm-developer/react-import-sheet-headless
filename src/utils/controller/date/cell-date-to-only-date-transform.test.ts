import { describe, it, expect } from 'vitest';
import {
  cellDateToOnlyDateTransform,
  DATE_TO_ONLY_DATE_TRANSFORM_ID,
  CellDateToOnlyDateTransform,
  registerDateToOnlyDateTransform,
} from './cell-date-to-only-date-transform.js';

const cell = { key: 'x', value: '2024-01-15T14:30:00', errors: [] as readonly { code: string }[] };
const row = { index: 0, errors: [] as readonly { code: string }[], cells: [cell] };

describe('cellDateToOnlyDateTransform', () => {
  it('should return date string YYYY-MM-DD', () => {
    const d = new Date('2024-01-15T14:30:45');
    expect(cellDateToOnlyDateTransform(d, cell, row)).toBe('2024-01-15');
  });

  it('should return value unchanged when not parseable as date', () => {
    expect(cellDateToOnlyDateTransform('x', cell, row)).toBe('x');
  });
});

describe('CellDateToOnlyDateTransform', () => {
  it('should expose id and Register returning id', () => {
    expect(CellDateToOnlyDateTransform.id).toBe(DATE_TO_ONLY_DATE_TRANSFORM_ID);
    expect(CellDateToOnlyDateTransform.Register()).toBe(DATE_TO_ONLY_DATE_TRANSFORM_ID);
  });
});

describe('registerDateToOnlyDateTransform', () => {
  it('should register with type cell', () => {
    const reg: { name?: string; type?: string } = {};
    registerDateToOnlyDateTransform((name, _fn, opts) => {
      reg.name = name;
      reg.type = opts.type;
    });
    expect(reg.name).toBe(DATE_TO_ONLY_DATE_TRANSFORM_ID);
    expect(reg.type).toBe('cell');
  });
});
