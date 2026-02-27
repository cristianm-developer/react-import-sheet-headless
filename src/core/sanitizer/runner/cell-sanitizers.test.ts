import { describe, it, expect } from 'vitest';
import { runCellSanitizers } from './cell-sanitizers.js';

describe('runCellSanitizers', () => {
  const row = { index: 0, cells: [{ key: 'a', value: 'x' }, { key: 'b', value: 'y' }] };

  it('should return cell unchanged when field has no sanitizers', () => {
    const cell = { key: 'a', value: '  hi  ' };
    const field = { name: 'a' };
    const getSanitizer = () => undefined;
    expect(runCellSanitizers(cell, row, field, getSanitizer)).toEqual(cell);
  });

  it('should apply sanitizer when registered', () => {
    const cell = { key: 'a', value: '  hi  ' };
    const field = { name: 'a', sanitizers: ['trim'] };
    const trim = (c: { key: string; value: unknown }) => ({ key: c.key, value: String(c.value).trim() });
    const getSanitizer = (name: string) => (name === 'trim' ? trim : undefined);
    expect(runCellSanitizers(cell, row, field, getSanitizer)).toEqual({ key: 'a', value: 'hi' });
  });

  it('should run multiple sanitizers in sequence', () => {
    const cell = { key: 'a', value: '  ab  ' };
    const field = { name: 'a', sanitizers: ['trim', 'upper'] };
    const trim = (c: { key: string; value: unknown }) => ({ key: c.key, value: String(c.value).trim() });
    const upper = (c: { key: string; value: unknown }) => ({ key: c.key, value: String(c.value).toUpperCase() });
    const getSanitizer = (name: string) => (name === 'trim' ? trim : name === 'upper' ? upper : undefined);
    expect(runCellSanitizers(cell, row, field, getSanitizer)).toEqual({ key: 'a', value: 'AB' });
  });
});
