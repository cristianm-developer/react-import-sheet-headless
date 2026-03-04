import { describe, it, expect } from 'vitest';
import { getSanitizerWorkerUrl } from './worker-url.js';

describe('getSanitizerWorkerUrl', () => {
  it('should return a Blob URL for inlined Worker', () => {
    const url = getSanitizerWorkerUrl();
    expect(url).toMatch(/^blob:/);
  });
});
