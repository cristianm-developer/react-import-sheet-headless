import { describe, expect, it } from 'vitest';
import { Registry } from './Registry.js';

describe('Registry', () => {
  it('should store and return a registered function by name', () => {
    const reg = new Registry<(x: number) => number>();
    const fn = (x: number) => x + 1;
    reg.register('inc', fn, { type: 'cell' });
    const entry = reg.get('inc');
    expect(entry).toBeDefined();
    expect(entry?.fn).toBe(fn);
    expect(entry?.type).toBe('cell');
  });

  it('should return undefined for unregistered name', () => {
    const reg = new Registry<(x: number) => number>();
    expect(reg.get('missing')).toBeUndefined();
  });

  it('should report has(name) true when registered', () => {
    const reg = new Registry<(x: number) => number>();
    reg.register('a', (x) => x, { type: 'row' });
    expect(reg.has('a')).toBe(true);
    expect(reg.has('b')).toBe(false);
  });

  it('should return entries by type via getByType', () => {
    const reg = new Registry<(x: number) => number>();
    reg.register('c1', (x) => x, { type: 'cell' });
    reg.register('c2', (x) => x + 1, { type: 'cell' });
    reg.register('r1', (x) => x, { type: 'row' });
    const cellEntries = reg.getByType('cell');
    expect(cellEntries).toHaveLength(2);
    expect(cellEntries.map((e) => e.name).sort()).toEqual(['c1', 'c2']);
    const rowEntries = reg.getByType('row');
    expect(rowEntries).toHaveLength(1);
    expect(rowEntries[0].name).toBe('r1');
  });

  it('should clear all entries on clear()', () => {
    const reg = new Registry<(x: number) => number>();
    reg.register('x', (x) => x, { type: 'cell' });
    reg.clear();
    expect(reg.get('x')).toBeUndefined();
    expect(reg.has('x')).toBe(false);
  });
});
