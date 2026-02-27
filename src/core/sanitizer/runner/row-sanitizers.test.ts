import { describe, it, expect } from 'vitest';
import { runRowSanitizers } from './row-sanitizers.js';

describe('runRowSanitizers', () => {
  const row = { index: 0, cells: [{ key: 'a', value: 'x' }] };
  const layout = { name: 's', version: '1', fields: {} };

  it('should return row unchanged when no row sanitizers', () => {
    expect(runRowSanitizers(row, layout, () => undefined)).toBe(row);
  });

  it('should return row when sanitizer returns row', () => {
    const updated = { index: 0, cells: [{ key: 'a', value: 'y' }] };
    const getSanitizer = () => () => updated;
    expect(runRowSanitizers(row, { ...layout, rowSanitizers: ['id'] }, getSanitizer)).toEqual(updated);
  });

  it('should return null when sanitizer returns null', () => {
    const getSanitizer = () => () => null;
    expect(runRowSanitizers(row, { ...layout, rowSanitizers: ['drop'] }, getSanitizer)).toBeNull();
  });
});
