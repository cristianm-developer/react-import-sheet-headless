import { describe, it, expect } from 'vitest';
import { getValidatorWorkerUrl } from './worker-url.js';

describe('getValidatorWorkerUrl', () => {
  it('should return a URL that includes validator.worker', () => {
    const url = getValidatorWorkerUrl();
    expect(url).toContain('validator.worker');
  });
});
