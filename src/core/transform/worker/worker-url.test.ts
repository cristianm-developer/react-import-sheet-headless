import { describe, it, expect } from 'vitest';
import { getTransformWorkerUrl } from './worker-url.js';

describe('getTransformWorkerUrl', () => {
  it('should return a Blob URL for inlined Worker', () => {
    const url = getTransformWorkerUrl();
    expect(url).toMatch(/^blob:/);
  });

  it('should return a valid URL', () => {
    const url = getTransformWorkerUrl();
    expect(() => new URL(url)).not.toThrow();
  });
});
