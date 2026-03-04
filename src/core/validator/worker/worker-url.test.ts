import { describe, it, expect } from 'vitest';
import { getValidatorWorkerUrl } from './worker-url.js';

describe('getValidatorWorkerUrl', () => {
  it('should return a Blob URL for inlined Worker', () => {
    const url = getValidatorWorkerUrl();
    expect(url).toMatch(/^blob:/);
  });
});
