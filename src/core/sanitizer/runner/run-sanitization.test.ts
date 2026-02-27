import { describe, it, expect, vi } from 'vitest';
import { runSanitization } from './run-sanitization.js';

describe('runSanitization', () => {
  const convertedSheet = {
    name: 's',
    filesize: 0,
    documentHash: 'h',
    headers: ['a', 'b'],
    rows: [
      { index: 0, cells: [{ key: 'a', value: '  x  ' }, { key: 'b', value: '10' }] },
      { index: 1, cells: [{ key: 'a', value: 'drop' }, { key: 'b', value: '20' }] },
      { index: 2, cells: [{ key: 'a', value: '  z  ' }, { key: 'b', value: '30' }] },
    ],
  };
  const layout = {
    name: 's',
    version: '1',
    rowSanitizers: ['drop'] as const,
    fields: {
      a: { name: 'a', sanitizers: ['trim'], valueType: undefined },
      b: { name: 'b', valueType: 'number' as const },
    },
  };

  it('should cast valueType and run cell sanitizers and discard row when row sanitizer returns null', () => {
    const trim = (c: { key: string; value: unknown }) => ({ key: c.key, value: String(c.value).trim() });
    const dropRow = (_row: { index: number; cells: { value: unknown }[] }, _p?: unknown) =>
      _row.cells[0]?.value === 'drop' ? null : _row;
    const getters = {
      getCellSanitizer: (name: string) => (name === 'trim' ? trim : undefined),
      getRowSanitizer: (name: string) => (name === 'drop' ? dropRow : undefined),
      getSheetSanitizer: () => undefined,
    };
    const result = runSanitization(convertedSheet, layout, getters);
    expect(result.rows).toHaveLength(2);
    expect(result.rowsCount).toBe(2);
    expect(result.rows[0]?.cells[0]).toEqual({ key: 'a', value: 'x' });
    expect(result.rows[0]?.cells[1]).toEqual({ key: 'b', value: 10 });
    expect(result.rows[1]?.cells[0]).toEqual({ key: 'a', value: 'z' });
    expect(result.rows[1]?.cells[1]).toEqual({ key: 'b', value: 30 });
  });

  it('should call onProgress with throttled updates', () => {
    const onProgress = vi.fn();
    const getters = {
      getCellSanitizer: () => undefined,
      getRowSanitizer: () => undefined,
      getSheetSanitizer: () => undefined,
    };
    runSanitization(convertedSheet, layout, getters, onProgress);
    expect(onProgress).toHaveBeenCalled();
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    expect(lastCall[0]).toMatchObject({ phase: 'sanitizing', localPercent: 100, totalRows: 3 });
  });
});
