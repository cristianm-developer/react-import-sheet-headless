# Bug Fix: Worker Loading Failure in npm Packages

**Date:** 2026-03-04  
**Version Fixed:** 1.0.5  
**Severity:** Critical - Core functionality was completely broken when library was consumed as npm package  
**Error:** `"r.load is not a function"` with code `PARSER_FAILED`

---

## Summary

When the headless library was consumed as an npm package (e.g., in a Storybook or Vite project), the CSV parser Worker failed to load, causing all imports to fail with the error `"r.load is not a function"`. This was a critical bug that made the library unusable in production.

---

## Root Cause

### The Problem

The library used `import.meta.url` to resolve Worker file paths:

```typescript
// Before (broken)
export function getParserWorkerUrl(): string {
  return new URL('./parser.worker.js', import.meta.url).href;
}
```

**Why this failed:**

1. When the library was **developed locally**, `import.meta.url` pointed to the source file location, and `./parser.worker.js` resolved correctly
2. When the library was **consumed as an npm package**, `import.meta.url` pointed to the **consumer's bundle location** (e.g., `node_modules/@cristianmpx/react-import-sheet-headless/dist/index.js`)
3. The consumer's bundler (Vite, Webpack, etc.) would try to resolve `./parser.worker.js` relative to **its own bundle output**, not the library's `dist` folder
4. The Worker file didn't exist in the consumer's context, causing the Worker to fail to load
5. When the consumer called `workerProxy.load()`, it failed with `"r.load is not a function"` because the Worker proxy was invalid

### The Error Message

The error `"r.load is not a function"` was confusing because:

- `r` is a minified variable name (likely referring to the Worker proxy)
- The error suggested a missing method, but the real issue was that the Worker never loaded
- The error was correctly caught and exposed through `useSheetData().errors`, but the root cause was in the bundling strategy

---

## Solution

### Inline Workers as Blob URLs

Workers are now inlined as strings in the source code and loaded as Blob URLs at runtime:

```typescript
// After (fixed)
export function getParserWorkerUrl(): string {
  const workerCode = 'import{a as R}from"./chunk-MIVE7CP7.js";...'; // Full Worker code as string
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
```

### Build Process Changes

**1. Disable Code Splitting for Workers**

Updated `tsup.config.ts`:

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'parser.worker': 'src/core/parser/worker/parser.worker.ts',
    // ... other workers
  },
  format: ['esm'],
  dts: true,
  minify: true,
  external: ['react', 'react-dom'],
  sourcemap: true,
  splitting: false, // ← Disable code splitting
  noExternal: ['papaparse', 'xlsx', 'js-sha256', 'comlink'], // ← Bundle all deps
});
```

**Why:** Without this, Workers would have dynamic imports like `await import("./csv-parser-3IOLGOEK.js")`, which would fail when the Worker runs from a Blob URL (no file system context to resolve relative imports).

**2. Post-Build Inlining Script**

Created `scripts/inline-workers.mjs` that:

1. Reads each Worker bundle from `dist/`
2. Generates `worker-url.ts` files with the Worker code as strings
3. Creates Blob URLs from these strings at runtime

**3. Two-Stage Build**

Updated build script in `package.json`:

```json
"build": "tsup --minify && node scripts/inline-workers.mjs && tsup --minify"
```

**Why two builds:**

1. First build: Generate Worker bundles
2. Inline script: Read Workers and update `worker-url.ts` files
3. Second build: Bundle the main library with inlined Workers

---

## Impact

### What Changed

**Bundle Sizes:**

- Main bundle: ~20 KB → ~421 KB (includes all inlined Workers)
- Parser Worker: ~2 KB → ~369 KB (includes papaparse, xlsx, js-sha256, comlink)
- Other Workers: Also increased due to bundled dependencies

**Loading Strategy:**

- Workers are now loaded from Blob URLs instead of file paths
- Workers are self-contained (no external dependencies or dynamic imports)
- Works correctly in all bundler environments (Vite, Webpack, Rollup, etc.)

### Trade-offs

**Pros:**

- ✅ Library works correctly when consumed as npm package
- ✅ No consumer configuration required (bundler-agnostic)
- ✅ Workers load reliably in all environments
- ✅ No external file dependencies

**Cons:**

- ❌ Larger main bundle (~421 KB vs ~20 KB)
- ❌ Workers are duplicated in the bundle (each Worker is inlined separately)
- ❌ No code splitting for Workers

**Why the trade-off is acceptable:**

1. Workers are loaded **lazily** (only when `processFile()` is called)
2. The library was **completely broken** before this fix
3. Bundle size is acceptable for a file import/validation library
4. Consumers don't need to configure their bundler (better DX)

---

## Verification

### Tests

All tests pass after the fix:

- ✅ 567 tests passed
- ✅ 92.85% code coverage (above 90% threshold)
- ✅ Worker-url tests updated to expect Blob URLs

### What to Test in Consuming Applications

After upgrading to version 1.0.5:

1. **CSV Import:** Upload a CSV file and verify it parses correctly
2. **XLSX Import:** Upload an XLSX file and verify it parses correctly
3. **Error Handling:** Upload an invalid file and verify errors are exposed through `useSheetData().errors`
4. **Status Transitions:** Verify status changes from `idle` → `loading` → `success` (not stuck in `loading` or `error`)
5. **Convert Result:** Verify `convertResult` is populated after parsing
6. **Sheet Data:** Verify `sheet` is populated after validation

---

## Migration Guide

### From 1.0.4 to 1.0.5

**No code changes required!** This is a bug fix that makes the library work as originally intended.

**What you should see:**

- ✅ CSV and XLSX files now parse correctly
- ✅ Status transitions work as documented
- ✅ `convertResult` and `sheet` are populated
- ✅ No more `"r.load is not a function"` errors

**Bundle size impact:**

- Your application bundle will increase by ~421 KB (the inlined Workers)
- This is a one-time cost; Workers are loaded lazily when needed

---

## Technical Details

### Why import.meta.url Doesn't Work for npm Packages

When a library uses `import.meta.url` to resolve relative paths:

```typescript
new URL('./worker.js', import.meta.url);
```

**In development (library repo):**

- `import.meta.url` = `file:///path/to/library/src/hooks/useParserWorker.ts`
- Resolves to: `file:///path/to/library/src/hooks/worker.js` ✅

**In production (consumed as npm package):**

- `import.meta.url` = `http://localhost:3000/assets/index-abc123.js` (consumer's bundle)
- Resolves to: `http://localhost:3000/assets/worker.js` ❌ (doesn't exist)

The Worker file exists at `node_modules/@cristianmpx/react-import-sheet-headless/dist/parser.worker.js`, but the consumer's bundler doesn't know to copy it or resolve it correctly.

### Why Blob URLs Work

Blob URLs are created at runtime from the Worker code string:

```typescript
const workerCode = '/* full worker code as string */';
const blob = new Blob([workerCode], { type: 'application/javascript' });
const url = URL.createObjectURL(blob); // blob:http://localhost:3000/abc-123-def
```

**Benefits:**

- No file system dependencies
- Works in all bundler environments
- No consumer configuration required
- Workers are guaranteed to be available (inlined in the bundle)

### Alternative Solutions Considered

**Option A: Export Workers as separate entry points**

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./workers/parser": "./dist/parser.worker.js"
  }
}
```

❌ Rejected: Requires consumer to configure their bundler to handle Worker files

**Option B: Use a bundler plugin**
❌ Rejected: Adds complexity and requires consumer setup

**Option C: Inline Workers as Blob URLs** ✅ Selected

- Works in all environments
- No consumer configuration
- Larger bundle but acceptable trade-off

---

## Related Issues

- [Vite Issue #15618: Bundling a worker in library mode results in 404](https://github.com/vitejs/vite/issues/15618)
- [tsup Issue #1240: import.meta.url resolution in bundled packages](https://github.com/egoist/tsup/issues/1240)

---

## Acknowledgments

Thanks to @cristianmpx/react-import-sheet-ui-raw for the detailed bug report and diagnostic work that helped identify the root cause.
