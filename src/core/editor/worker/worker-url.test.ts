import { describe, it, expect } from 'vitest';
import { getEditWorkerUrl } from './worker-url.js';

describe('getEditWorkerUrl', () => {
  it('should return a URL that includes edit.worker', () => {
    const url = getEditWorkerUrl();
    expect(url).toContain('edit.worker');
  });

  it('should return a valid URL', () => {
    const url = getEditWorkerUrl();
    expect(() => new URL(url)).not.toThrow();
  });
});
