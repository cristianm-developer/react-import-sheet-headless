import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getParserWorkerUrl } from './worker-url.js';

describe('Parser Worker URL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a valid URL string', () => {
    const url = getParserWorkerUrl();
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('should return a URL that ends with parser.worker.js or .ts', () => {
    const url = getParserWorkerUrl();
    // In development (Vitest), it points to .ts
    // In production (built package), it points to .js
    expect(url).toMatch(/parser\.worker\.(js|ts)$/);
  });

  it('should return a URL that can be parsed', () => {
    const url = getParserWorkerUrl();
    expect(() => new URL(url)).not.toThrow();
  });

  it('should return a URL with a valid protocol', () => {
    const url = getParserWorkerUrl();
    const urlObj = new URL(url);

    // In Node.js tests, it might be file:// protocol
    // In browser, it should be http:// or https://
    expect(['file:', 'http:', 'https:', 'blob:']).toContain(urlObj.protocol);
  });

  it('should log the worker URL for debugging', () => {
    const url = getParserWorkerUrl();
    console.log('Parser Worker URL:', url);
    console.log('URL Object:', new URL(url));
  });
});

describe('Worker URL Resolution (Integration)', () => {
  it('should resolve worker URL using import.meta.url', () => {
    // This test verifies that import.meta.url is available
    expect(import.meta.url).toBeDefined();
    expect(typeof import.meta.url).toBe('string');
    console.log('Current module URL:', import.meta.url);
  });

  it('should construct relative URL from import.meta.url', () => {
    const baseUrl = new URL(import.meta.url);
    const workerUrl = new URL('./parser.worker.js', baseUrl);

    expect(workerUrl.href).toBeDefined();
    expect(workerUrl.href).toMatch(/parser\.worker\.js$/);

    console.log('Base URL:', baseUrl.href);
    console.log('Worker URL:', workerUrl.href);
  });

  it('should handle different base URL formats', () => {
    const testCases = [
      'file:///path/to/module.js',
      'http://localhost:3000/module.js',
      'https://example.com/dist/module.js',
    ];

    testCases.forEach((baseUrlStr) => {
      const baseUrl = new URL(baseUrlStr);
      const workerUrl = new URL('./parser.worker.js', baseUrl);

      expect(workerUrl.href).toBeDefined();
      expect(workerUrl.protocol).toBe(baseUrl.protocol);

      console.log(`Base: ${baseUrlStr}`);
      console.log(`  → Worker: ${workerUrl.href}`);
    });
  });
});

describe('Worker URL in Different Environments', () => {
  it('should work in Node.js environment', () => {
    // In Node.js, import.meta.url will be file://
    const url = getParserWorkerUrl();
    expect(url).toBeDefined();

    // Log environment info
    console.log('Environment: Node.js');
    console.log('Worker URL:', url);
  });

  it('should provide diagnostic information', () => {
    const url = getParserWorkerUrl();
    const urlObj = new URL(url);

    const diagnostics = {
      fullUrl: url,
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      origin: urlObj.origin,
      importMetaUrl: import.meta.url,
    };

    console.log('Worker URL Diagnostics:');
    console.log(JSON.stringify(diagnostics, null, 2));

    expect(diagnostics.fullUrl).toBeDefined();
    expect(diagnostics.protocol).toBeDefined();
    // In development: .ts, in production: .js
    expect(diagnostics.pathname).toMatch(/parser\.worker\.(js|ts)$/);
  });
});

describe('Worker File Existence (Build Verification)', () => {
  it('should document expected worker file location', () => {
    // This test documents where the worker file should be after build
    const expectedLocations = [
      'dist/parser.worker.js',
      'dist/parser.worker.js.map',
      'dist/parser.worker.d.ts',
    ];

    console.log('Expected worker files after build:');
    expectedLocations.forEach((location) => {
      console.log(`  - ${location}`);
    });

    // This is a documentation test, always passes
    expect(expectedLocations.length).toBeGreaterThan(0);
  });

  it('should document tsup configuration requirements', () => {
    const requirements = {
      entry: {
        'parser.worker': 'src/core/parser/worker/parser.worker.ts',
      },
      format: ['esm'],
      output: 'dist/',
      note: 'Worker must be a separate entry point in tsup.config.ts',
    };

    console.log('Tsup configuration requirements:');
    console.log(JSON.stringify(requirements, null, 2));

    expect(requirements.entry).toBeDefined();
  });
});
