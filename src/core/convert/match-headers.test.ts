import { describe, expect, it } from 'vitest';
import type { RawSheet } from '../../types/raw-sheet.js';
import type { SheetLayout } from '../../types/sheet-layout.js';
import { matchHeadersToLayout } from './match-headers.js';

function makeRawSheet(headers: string[], rows: unknown[][]): RawSheet {
  return {
    name: 'Sheet1',
    filesize: 0,
    documentHash: '',
    headers,
    rows: rows.map((cells, index) => ({
      index,
      cells: cells.map((value, i) => ({ key: headers[i] ?? '', value })),
    })),
  };
}

function makeLayout(fieldNames: string[]): SheetLayout {
  const fields: Record<string, { name: string }> = {};
  for (const name of fieldNames) {
    fields[name] = { name };
  }
  return { name: 'Test', version: '1', fields };
}

describe('matchHeadersToLayout', () => {
  it('should match all layout fields when headers match exactly', () => {
    const raw = makeRawSheet(['Email', 'Name'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(0);
    expect(fieldToHeader['Email']).toBe('Email');
    expect(fieldToHeader['Name']).toBe('Name');
  });

  it('should match headers case-insensitively by default', () => {
    const raw = makeRawSheet(['EMAIL', 'name'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(0);
    expect(fieldToHeader['Email']).toBe('EMAIL');
    expect(fieldToHeader['Name']).toBe('name');
  });

  it('should report mismatch when a layout column is missing in the file', () => {
    const raw = makeRawSheet(['Email'], [['a@b.com']]);
    const layout = makeLayout(['Email', 'Name']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toMatchObject({ expected: 'Name', found: null });
    expect(fieldToHeader['Email']).toBe('Email');
    expect(fieldToHeader['Name']).toBeNull();
  });

  it('should use headerToFieldMap when provided', () => {
    const raw = makeRawSheet(['Col1', 'Col2'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(raw, layout, {
      Col1: 'Email',
      Col2: 'Name',
    });
    expect(mismatches).toHaveLength(0);
    expect(fieldToHeader['Email']).toBe('Col1');
    expect(fieldToHeader['Name']).toBe('Col2');
  });

  it('should respect case-sensitive option when set', () => {
    const raw = makeRawSheet(['email', 'Name'], [['a@b.com', 'Alice']]);
    const layout = makeLayout(['Email', 'Name']);
    const { mismatches } = matchHeadersToLayout(raw, layout, {}, { caseSensitive: true });
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches.some((m) => m.expected === 'Email')).toBe(true);
  });
});
