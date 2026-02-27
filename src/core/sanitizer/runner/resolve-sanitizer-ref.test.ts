import { describe, it, expect } from 'vitest';
import { resolveSanitizerRef } from './resolve-sanitizer-ref.js';

describe('resolveSanitizerRef', () => {
  it('should return name only when ref is a string', () => {
    expect(resolveSanitizerRef('trim')).toEqual({ name: 'trim' });
  });

  it('should return name and params when ref is an object', () => {
    expect(resolveSanitizerRef({ name: 'trim', params: { x: 1 } })).toEqual({
      name: 'trim',
      params: { x: 1 },
    });
  });

  it('should return name without params when params is undefined', () => {
    expect(resolveSanitizerRef({ name: 'email' })).toEqual({ name: 'email' });
  });
});
