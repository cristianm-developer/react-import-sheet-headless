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
        '**/core/sanitizer/hooks/useSanitizerWorker.ts',
        '**/core/validator/hooks/useValidatorWorker.ts',
        '**/core/transform/hooks/useTransformWorker.ts',
        '**/hooks/useImportSheet.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
    },
  },
});