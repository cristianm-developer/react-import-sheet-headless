import { describe, it, expect } from 'vitest';
import { getSanitizerWorkerUrl } from './worker-url.js';

describe('getSanitizerWorkerUrl', () => {
  it('should return a URL that includes sanitizer.worker', () => {
    const url = getSanitizerWorkerUrl();
    expect(url).toContain('sanitizer.worker');
  });
});
