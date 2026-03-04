import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    dts: true,
    minify: true,
    external: ['react', 'react-dom'],
    sourcemap: true,
    splitting: false,
    noExternal: ['papaparse', 'xlsx', 'js-sha256']
})