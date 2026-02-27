import { describe, it, expect } from 'vitest';
import { resolveValidatorRef } from './resolve-validator-ref.js';

describe('resolveValidatorRef', () => {
  it('should return name only when ref is a string', () => {
    expect(resolveValidatorRef('required')).toEqual({ name: 'required' });
  });

  it('should return name and params when ref is an object', () => {
    expect(
      resolveValidatorRef({ name: 'in-list', params: { list: ['a', 'b'] } }),
    ).toEqual({ name: 'in-list', params: { list: ['a', 'b'] } });
  });

  it('should allow params to be undefined', () => {
    expect(resolveValidatorRef({ name: 'email' })).toEqual({ name: 'email' });
  });
});
