import { describe, it, expect } from 'vitest';
import { getEditWorkerUrl } from './worker-url.js';

describe('getEditWorkerUrl', () => {
  it('should return a Blob URL for inlined Worker', () => {
    const url = getEditWorkerUrl();
    expect(url).toMatch(/^blob:/);
  });

  it('should return a valid URL', () => {
    const url = getEditWorkerUrl();
    expect(() => new URL(url)).not.toThrow();
  });
});
