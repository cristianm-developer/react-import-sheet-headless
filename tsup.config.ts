import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
      index: 'src/index.ts',
      'parser.worker': 'src/core/parser/worker/parser.worker.ts',
      'sanitizer.worker': 'src/core/sanitizer/worker/sanitizer.worker.ts',
      'validator.worker': 'src/core/validator/worker/validator.worker.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    minify: true,
    external: ['react', 'react-dom'],
    sourcemap: true
})