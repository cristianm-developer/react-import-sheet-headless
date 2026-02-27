import { describe, it, expect } from 'vitest';
import { runCellTransforms } from './cell-transforms.js';

const row = {
  index: 0,
  errors: [] as readonly { code: string }[],
  cells: [{ key: 'name', value: 'hello', errors: [] as readonly { code: string }[] }],
};
const cell = row.cells[0]!;
const fieldWithTransforms = { name: 'name', transformations: ['toUpperCase', 'trim'] as const };

describe('runCellTransforms', () => {
  it('should return cell.value when cell has errors (safe-first)', () => {
    const cellWithErrors = { ...cell, errors: [{ code: 'REQUIRED', level: 'error' }] };
    const getTransform = () => (v: unknown) => String(v).toUpperCase();
    const result = runCellTransforms(cellWithErrors, row, fieldWithTransforms, getTransform);
    expect(result).toBe('hello');
  });

  it('should return cell.value when field has no transformations', () => {
    const result = runCellTransforms(cell, row, { name: 'x' }, () => undefined);
    expect(result).toBe('hello');
  });

  it('should return cell.value when getTransform returns undefined for all', () => {
    const result = runCellTransforms(cell, row, fieldWithTransforms, () => undefined);
    expect(result).toBe('hello');
  });

  it('should run transforms in sequence and return new value', () => {
    const getTransform = (name: string) =>
      name === 'toUpperCase' ? (v: unknown) => String(v).toUpperCase() : undefined;
    const result = runCellTransforms(cell, row, fieldWithTransforms, getTransform);
    expect(result).toBe('HELLO');
  });
});
