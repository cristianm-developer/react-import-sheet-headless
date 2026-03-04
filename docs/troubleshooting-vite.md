# Troubleshooting: Vite/Storybook Issues

## Error: "t.load is not a function" or "PARSER_FAILED"

### Cause

Vite's dependency optimization (`optimizeDeps`) pre-bundles npm packages for faster loading. However, when it optimizes `@cristianmpx/react-import-sheet-headless`, it **breaks the Web Worker code** that uses Blob URLs.

This happens because:

1. Vite moves the optimized dependency to `.vite/deps/`
2. The worker code (inlined as Blob URLs) cannot be properly resolved
3. Comlink cannot communicate with the worker
4. The worker proxy has no methods, causing `"t.load is not a function"`

### Solution

**Exclude the headless library from Vite's optimization.**

#### For Vite projects:

Edit `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

#### For Storybook projects:

Edit `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    // ... your other addons
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(config) {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [
          ...(config.optimizeDeps?.exclude || []),
          '@cristianmpx/react-import-sheet-headless',
        ],
      },
    };
  },
};

export default config;
```

### After applying the fix:

```bash
# 1. Delete Vite cache
rm -rf node_modules/.vite .vite

# 2. Restart your dev server
npm run dev
# or
npm run storybook

# 3. Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
```

---

## Alternative Solution: Include instead of Exclude

If excluding causes other issues, you can try **explicitly including** the library:

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

However, **exclude is the recommended approach** for libraries that use Web Workers with Blob URLs.

---

## Other Vite-related Issues

### Issue: Workers not loading in production build

If workers fail only in production builds (`npm run build`), ensure your build config doesn't strip the worker code:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunking
      },
    },
  },
});
```

### Issue: "Not allowed to load local resource: blob:null/..."

This error occurs in restricted environments (e.g., iframes with strict CSP). The library uses Blob URLs for workers, which may be blocked by Content Security Policy.

**Solution:** Update your CSP headers to allow `blob:` URLs:

```
Content-Security-Policy: worker-src 'self' blob:;
```

---

## Still Having Issues?

If the problem persists after trying these solutions:

1. Verify you're using v1.0.6 or later: `npm list @cristianmpx/react-import-sheet-headless`
2. Clear all caches: `rm -rf node_modules/.vite .vite node_modules/.cache .cache`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check browser console for additional errors (F12 → Console)
5. Open an issue on GitHub with:
   - Your `vite.config.ts` or `.storybook/main.ts`
   - Full error message from browser console
   - Steps to reproduce

---

## References

- [Vite Issue #21422: Importing worker from a vite library fails](https://github.com/vitejs/vite/issues/21422)
- [Vite Docs: Dependency Optimization](https://vitejs.dev/guide/dep-optimization.html)
- [Vite Docs: optimizeDeps.exclude](https://vitejs.dev/config/dep-optimization-options.html#optimizedeps-exclude)
