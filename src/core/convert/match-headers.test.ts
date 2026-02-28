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

  it('should not fuzzy-match when fuzzyHeaders is false (default)', () => {
    const raw = makeRawSheet(['Nombre', 'Email'], [['Alice', 'a@b.com']]);
    const layout = makeLayout(['Name', 'Email']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(1);
    expect(fieldToHeader['Name']).toBeNull();
    expect(fieldToHeader['Email']).toBe('Email');
  });

  it('should match similar headers when fuzzyHeaders is true', () => {
    const raw = makeRawSheet(['Nombre', 'Email'], [['Alice', 'a@b.com']]);
    const layout = makeLayout(['Name', 'Email']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(
      raw,
      layout,
      {},
      {
        fuzzyHeaders: true,
        fuzzyThreshold: 0.5,
      }
    );
    expect(mismatches).toHaveLength(0);
    expect(fieldToHeader['Name']).toBe('Nombre');
    expect(fieldToHeader['Email']).toBe('Email');
  });

  it('should not match when fuzzyHeaders is true but similarity below threshold', () => {
    const raw = makeRawSheet(['xyz', 'Email'], [['Alice', 'a@b.com']]);
    const layout = makeLayout(['Name', 'Email']);
    const { fieldToHeader, mismatches } = matchHeadersToLayout(
      raw,
      layout,
      {},
      {
        fuzzyHeaders: true,
        fuzzyThreshold: 0.99,
      }
    );
    expect(mismatches).toHaveLength(1);
    expect(fieldToHeader['Name']).toBeNull();
    expect(fieldToHeader['Email']).toBe('Email');
  });

  it('should set required true on mismatch when field has no required flag', () => {
    const raw = makeRawSheet(['Email'], [['a@b.com']]);
    const layout: SheetLayout = {
      name: 'Test',
      version: '1',
      fields: { Email: { name: 'Email' }, Name: { name: 'Name' } },
    };
    const { mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toMatchObject({ expected: 'Name', required: true });
  });

  it('should set required false on mismatch when field has required: false', () => {
    const raw = makeRawSheet(['Email'], [['a@b.com']]);
    const layout: SheetLayout = {
      name: 'Test',
      version: '1',
      fields: {
        Email: { name: 'Email' },
        Notes: { name: 'Notes', required: false },
      },
    };
    const { mismatches } = matchHeadersToLayout(raw, layout);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toMatchObject({ expected: 'Notes', required: false });
  });
});
