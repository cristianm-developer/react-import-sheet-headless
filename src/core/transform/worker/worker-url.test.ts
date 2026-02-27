import { describe, it, expect } from 'vitest';
import { getTransformWorkerUrl } from './worker-url.js';

describe('getTransformWorkerUrl', () => {
  it('should return a URL that includes transform.worker', () => {
    const url = getTransformWorkerUrl();
    expect(url).toContain('transform.worker');
  });

  it('should return a valid URL', () => {
    const url = getTransformWorkerUrl();
    expect(() => new URL(url)).not.toThrow();
  });
});
