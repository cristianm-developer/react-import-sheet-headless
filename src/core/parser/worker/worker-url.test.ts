import { describe, expect, it } from 'vitest';
import { getParserWorkerUrl } from './worker-url.js';

describe('getParserWorkerUrl', () => {
  it('should return a string URL containing parser.worker', () => {
    const url = getParserWorkerUrl();
    expect(typeof url).toBe('string');
    expect(url).toContain('parser.worker');
  });
});
