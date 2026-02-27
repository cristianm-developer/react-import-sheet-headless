import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/index.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'vitest.setup.ts',
        '**/*.worker.ts',
        '**/core/parser/hooks/useParserWorker.ts',
        '**/hooks/useImportSheet.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 82, // parser/adapter branches; raise when covered
        statements: 95,
      },
    },
  },
});