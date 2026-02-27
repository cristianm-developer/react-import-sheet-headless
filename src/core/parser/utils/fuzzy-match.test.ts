import { describe, it, expect } from 'vitest';
import { getSimilarity, mapHeaders, normalize } from './fuzzy-match.js';

describe('normalize', () => {
  it('should trim and lowercase and remove accents', () => {
    expect(normalize('  Nombre  ')).toBe('nombre');
    expect(normalize('Teléfono')).toBe('telefono');
    expect(normalize('EMAIL')).toBe('email');
  });
});

describe('getSimilarity', () => {
  it('should return 1 for identical strings after normalizing', () => {
    expect(getSimilarity('nombre', 'nombre')).toBe(1);
    expect(getSimilarity('Nombre', 'NOMBRE')).toBe(1);
    expect(getSimilarity('  email  ', 'EMAIL')).toBe(1);
  });

  it('should return values less than 1 for different strings', () => {
    expect(getSimilarity('name', 'nombre')).toBeLessThan(1);
    expect(getSimilarity('a', 'b')).toBe(0);
  });

  it('should handle empty longer string as 1', () => {
    expect(getSimilarity('', '')).toBe(1);
  });
});

describe('mapHeaders', () => {
  it('should assign each key at most once (greedy by score)', () => {
    const raw = ['Name', 'Full Name', 'Email'];
    const keys = ['name', 'email'];
    const result = mapHeaders(raw, keys, { threshold: 0.5 });
    expect(result).toHaveLength(2);
    const nameItem = result.find((r) => r.key === 'name');
    const emailItem = result.find((r) => r.key === 'email');
    expect(nameItem?.matchedHeader).toBeTruthy();
    expect(emailItem?.matchedHeader).toBe('Email');
    const matched = result.map((r) => r.matchedHeader).filter(Boolean);
    expect(new Set(matched).size).toBe(matched.length);
  });

  it('should respect threshold and return null when below', () => {
    const result = mapHeaders(['xyz'], ['name'], { threshold: 0.99 });
    expect(result[0]).toEqual({ key: 'name', matchedHeader: null });
  });

  it('should match with accents and spaces when threshold allows', () => {
    const result = mapHeaders(['  Nombre  ', 'Teléfono'], ['nombre', 'telefono'], {
      threshold: 0.8,
    });
    expect(result[0]?.matchedHeader).toBe('  Nombre  ');
    expect(result[1]?.matchedHeader).toBe('Teléfono');
  });
});
