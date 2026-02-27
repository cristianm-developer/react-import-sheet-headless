import { describe, it, expect } from 'vitest';
import { applyValueTypeCasting } from './casting.js';

describe('applyValueTypeCasting', () => {
  it('should return cell unchanged when valueType is undefined', () => {
    const cell = { key: 'a', value: '  x  ' };
    expect(applyValueTypeCasting(cell, undefined)).toEqual(cell);
  });

  it('should cast to string', () => {
    expect(applyValueTypeCasting({ key: 'a', value: 42 }, 'string')).toEqual({ key: 'a', value: '42' });
    expect(applyValueTypeCasting({ key: 'a', value: null }, 'string')).toEqual({ key: 'a', value: '' });
  });

  it('should cast to number', () => {
    expect(applyValueTypeCasting({ key: 'a', value: '123' }, 'number')).toEqual({ key: 'a', value: 123 });
    expect(applyValueTypeCasting({ key: 'a', value: '' }, 'number')).toEqual({ key: 'a', value: null });
    expect(applyValueTypeCasting({ key: 'a', value: '1,000' }, 'number')).toEqual({ key: 'a', value: 1000 });
  });

  it('should cast to bool', () => {
    expect(applyValueTypeCasting({ key: 'a', value: 'true' }, 'bool')).toEqual({ key: 'a', value: true });
    expect(applyValueTypeCasting({ key: 'a', value: 'false' }, 'bool')).toEqual({ key: 'a', value: false });
    expect(applyValueTypeCasting({ key: 'a', value: null }, 'bool')).toEqual({ key: 'a', value: false });
  });

  it('should cast to date', () => {
    const d = new Date('2025-01-15');
    expect(applyValueTypeCasting({ key: 'a', value: '2025-01-15' }, 'date')).toEqual({
      key: 'a',
      value: d,
    });
    expect(applyValueTypeCasting({ key: 'a', value: null }, 'date')).toEqual({ key: 'a', value: null });
  });

  it('should cast number from Date (timestamp)', () => {
    const d = new Date('2025-01-15');
    expect(applyValueTypeCasting({ key: 'a', value: d }, 'number')).toEqual({
      key: 'a',
      value: d.getTime(),
    });
  });

  it('should cast toBool with yes/no and number', () => {
    expect(applyValueTypeCasting({ key: 'a', value: 'yes' }, 'bool')).toEqual({ key: 'a', value: true });
    expect(applyValueTypeCasting({ key: 'a', value: 'no' }, 'bool')).toEqual({ key: 'a', value: false });
    expect(applyValueTypeCasting({ key: 'a', value: 1 }, 'bool')).toEqual({ key: 'a', value: true });
    expect(applyValueTypeCasting({ key: 'a', value: 0 }, 'bool')).toEqual({ key: 'a', value: false });
  });

  it('should return null for number when value is NaN string', () => {
    expect(applyValueTypeCasting({ key: 'a', value: 'abc' }, 'number')).toEqual({ key: 'a', value: null });
  });

  it('should use default branch for unknown valueType', () => {
    const cell = { key: 'a', value: 1 };
    expect(applyValueTypeCasting(cell, 'unknown' as 'number')).toEqual(cell);
  });
});
