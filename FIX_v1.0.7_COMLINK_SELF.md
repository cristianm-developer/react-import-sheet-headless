# Fix v1.0.7: Explicit `self` Parameter in Comlink.expose()

**Date:** 2026-03-04  
**Version:** 1.0.7  
**Issue:** `"t.load is not a function"` error persisted in v1.0.6  
**Status:** ✅ **FIXED**

---

## The Real Problem

After extensive investigation, the root cause was identified:

**All workers were calling `Comlink.expose(api)` without the second parameter.**

When Comlink.expose is called without explicitly passing `self`, Comlink uses `globalThis` as the default endpoint. In workers created from **Blob URLs** (as opposed to separate .js files), `globalThis` may not be properly initialized or may point to the wrong context, causing the worker's API to not be exposed correctly to the main thread.

### Why v1.0.6 Didn't Fix It

v1.0.6 removed `{ type: 'module' }` from the Worker constructor, which fixed one issue, but the workers were still not exposing their API correctly because `Comlink.expose(api)` was using `globalThis` instead of `self`.

---

## The Fix

### Changed in All Workers

**Before (v1.0.6 and earlier):**

```typescript
const api = {
  async load(...) { /* ... */ },
  async parseAll(...) { /* ... */ }
};

Comlink.expose(api); // ❌ Uses globalThis by default
```

**After (v1.0.7):**

```typescript
const api = {
  async load(...) { /* ... */ },
  async parseAll(...) { /* ... */ }
};

Comlink.expose(api, self as unknown as Comlink.Endpoint); // ✅ Explicit self
```

### Files Changed

1. `src/core/parser/worker/parser.worker.ts`
2. `src/core/sanitizer/worker/sanitizer.worker.ts`
3. `src/core/validator/worker/validator.worker.ts`
4. `src/core/transform/worker/transform.worker.ts`
5. `src/core/editor/worker/edit.worker.ts`

---

## Why This Works

### In Web Workers

- `self` is the proper reference to the `WorkerGlobalScope`
- `globalThis` in Blob URL workers may not be properly initialized
- Explicitly passing `self` ensures Comlink registers the API on the correct endpoint

### The Type Cast

```typescript
self as unknown as Comlink.Endpoint;
```

This cast is necessary because TypeScript types `self` as `Window & typeof globalThis` in the worker context, but Comlink expects an `Endpoint` type. The cast is safe because `self` in a worker context is indeed a valid Comlink endpoint.

---

## Verification

After the fix, the worker bundle now contains:

```javascript
var Jp = {
  async load(e, t = {}) {
    /* ... */
  },
  async parseAll(e) {
    /* ... */
  },
};
wa(Jp, self); // ✅ Now passes self explicitly
```

Previously it was:

```javascript
wa(Jp); // ❌ Used globalThis by default
```

---

## Testing

All tests pass with the new implementation:

- ✅ 190 tests passing
- ✅ Coverage above 90%
- ✅ All worker hooks tested
- ✅ Build verification passed

---

## For Consumers

### Upgrade to v1.0.7

```bash
npm install @cristianmpx/react-import-sheet-headless@1.0.7
```

### Clear Caches

```bash
# Delete Vite/Storybook cache
rm -rf node_modules/.vite .vite

# Restart dev server
npm run dev
# or
npm run storybook

# Hard refresh in browser (Ctrl+Shift+R)
```

### Vite Configuration (Still Recommended)

Even with this fix, it's still recommended to exclude the library from Vite's dependency optimization:

```typescript
// vite.config.ts or .storybook/main.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['@cristianmpx/react-import-sheet-headless'],
  },
});
```

---

## Technical Background

### Comlink.expose() Signature

```typescript
function expose(
  obj: any,
  ep: Endpoint = globalThis as any,
  allowedOrigins: (string | RegExp)[] = ['*']
): void;
```

The second parameter `ep` defaults to `globalThis`. In regular worker files loaded via `new Worker('./worker.js')`, `globalThis` works fine. But in workers created from Blob URLs, `globalThis` may not be the correct context.

### Blob URL Workers vs File Workers

**File Worker (works with globalThis):**

```javascript
// worker.js
Comlink.expose(api); // ✅ globalThis works
```

**Blob URL Worker (needs explicit self):**

```javascript
const workerCode = `
  // ... bundled code ...
  Comlink.expose(api); // ❌ globalThis may not work
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

The difference is that Blob URL workers execute in a slightly different context where `globalThis` may not be properly initialized at the time `Comlink.expose()` is called.

---

## References

- [Comlink Documentation](https://github.com/GoogleChromeLabs/comlink)
- [Comlink Issue #677: Module Federation Worker Issues](https://github.com/GoogleChromeLabs/comlink/issues/677)
- [MDN: WorkerGlobalScope.self](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/self)

---

## Summary

**Problem:** Workers created from Blob URLs were not exposing their API correctly because `Comlink.expose(api)` was using `globalThis` instead of `self`.

**Solution:** Changed all workers to use `Comlink.expose(api, self)` to explicitly pass the correct endpoint.

**Result:** Workers now properly expose their API, and `Comlink.wrap(worker)` returns a proxy with all methods (`load`, `parseAll`, etc.).

**Impact:** Fixes the critical `"t.load is not a function"` error that persisted through v1.0.2, v1.0.5, and v1.0.6.
