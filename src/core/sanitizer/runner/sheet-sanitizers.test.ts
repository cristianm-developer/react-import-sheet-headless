import { describe, it, expect } from 'vitest';
import { runSheetSanitizers } from './sheet-sanitizers.js';

describe('runSheetSanitizers', () => {
  const sheet = {
    name: 's',
    filesize: 0,
    documentHash: 'h',
    headers: ['a'],
    rows: [{ index: 0, cells: [{ key: 'a', value: 'x' }] }],
  };
  const layout = { name: 's', version: '1', fields: {} };

  it('should return sheet unchanged when no sheet sanitizers', () => {
    expect(runSheetSanitizers(sheet, layout, () => undefined)).toBe(sheet);
  });

  it('should return updated sheet when sanitizer runs', () => {
    const updated = { ...sheet, name: 'updated' };
    const getSanitizer = () => () => updated;
    expect(runSheetSanitizers(sheet, { ...layout, sheetSanitizers: ['rename'] }, getSanitizer)).toEqual(updated);
  });
});
