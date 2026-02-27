import { describe, expect, it } from 'vitest';
import { streamHashHex } from './hash.js';

describe('streamHashHex', () => {
  it('should return a 64-character hex string for SHA-256', async () => {
    const blob = new Blob(['hello']);
    const hash = await streamHashHex(blob);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toHaveLength(64);
  });

  it('should return the same hash for the same content', async () => {
    const blob = new Blob(['same content']);
    const h1 = await streamHashHex(blob);
    const h2 = await streamHashHex(new Blob(['same content']));
    expect(h1).toBe(h2);
  });

  it('should return different hashes for different content', async () => {
    const h1 = await streamHashHex(new Blob(['a']));
    const h2 = await streamHashHex(new Blob(['b']));
    expect(h1).not.toBe(h2);
  });
});
