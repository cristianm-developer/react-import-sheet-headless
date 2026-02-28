import { describe, it, expect } from 'vitest';
import { getCellValue, sheetRowsToObjects, sheetToObjectsWithKeyMap } from './sheet-to-objects.js';
import type { Sheet, ValidatedRow } from '../../../types/sheet.js';

const row: ValidatedRow = {
  index: 0,
  errors: [],
  cells: [
    { key: 'Nombre', value: 'Ana', errors: [] },
    { key: 'Apellido', value: 'López', errors: [] },
  ],
};

const sheet: Sheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['Nombre', 'Apellido'],
  sheetLayout: { name: 'l', version: 1 },
  errors: [],
  rows: [
    row,
    {
      index: 1,
      errors: [],
      cells: [
        { key: 'Nombre', value: 'Bob', errors: [] },
        { key: 'Apellido', value: 'Smith', errors: [] },
      ],
    },
  ],
};

describe('getCellValue', () => {
  it('should return cell value when key exists', () => {
    expect(getCellValue(row, 'Nombre')).toBe('Ana');
    expect(getCellValue(row, 'Apellido')).toBe('López');
  });

  it('should return undefined when key is missing', () => {
    expect(getCellValue(row, 'Missing')).toBeUndefined();
  });
});

describe('sheetRowsToObjects', () => {
  it('should map each row to user-defined object via mapper', () => {
    const result = sheetRowsToObjects(sheet.rows, (r) => ({
      nombre: getCellValue(r, 'Nombre'),
      apellido: getCellValue(r, 'Apellido'),
    }));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ nombre: 'Ana', apellido: 'López' });
    expect(result[1]).toEqual({ nombre: 'Bob', apellido: 'Smith' });
  });

  it('should return empty array when rows is empty', () => {
    expect(sheetRowsToObjects([], () => ({}))).toEqual([]);
  });
});

describe('sheetToObjectsWithKeyMap', () => {
  it('should map sheet column keys to output attribute names', () => {
    const result = sheetToObjectsWithKeyMap(sheet, {
      Nombre: 'nombre',
      Apellido: 'apellido',
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ nombre: 'Ana', apellido: 'López' });
    expect(result[1]).toEqual({ nombre: 'Bob', apellido: 'Smith' });
  });

  it('should return empty array when sheet is null', () => {
    expect(sheetToObjectsWithKeyMap(null, { Nombre: 'nombre' })).toEqual([]);
  });

  it('should set undefined for missing columns in keyMap', () => {
    const result = sheetToObjectsWithKeyMap(sheet, { Nombre: 'nombre' });
    expect(result[0]).toEqual({ nombre: 'Ana' });
  });
});
