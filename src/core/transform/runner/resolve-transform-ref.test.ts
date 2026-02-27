import { describe, it, expect } from 'vitest';
import { resolveTransformRef } from './resolve-transform-ref.js';

describe('resolveTransformRef', () => {
  it('should return name only when ref is a string', () => {
    expect(resolveTransformRef('toUpperCase')).toEqual({ name: 'toUpperCase' });
  });

  it('should return name and params when ref is an object', () => {
    expect(
      resolveTransformRef({ name: 'format', params: { locale: 'en' } }),
    ).toEqual({ name: 'format', params: { locale: 'en' } });
  });

  it('should allow params to be undefined', () => {
    expect(resolveTransformRef({ name: 'trim' })).toEqual({ name: 'trim' });
  });
});
