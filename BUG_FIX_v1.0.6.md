# Bug Fix: Worker Module Type Issue (v1.0.6)

**Date:** 2026-03-04  
**Version:** 1.0.6  
**Severity:** Critical - Core functionality was broken  
**Error Fixed:** `"t.load is not a function"` (v1.0.5) / `"r.load is not a function"` (v1.0.2)

---

## Summary

Fixed a critical bug where Workers failed to initialize properly, causing the error `"t.load is not a function"` when trying to parse CSV or XLSX files. The issue affected versions 1.0.2 through 1.0.5.

## Root Cause

**The Problem:** Workers were being created with `type: "module"`:

```typescript
const worker = new Worker(getParserWorkerUrl(), { type: 'module' });
```

But the bundled worker code (from tsup) is **NOT** a proper ES module:

- The bundle starts with `var wf=Object.create;...` (IIFE/CommonJS style)
- It has NO `import` or `export` statements
- It's not valid ES module syntax

When the browser tries to execute non-module code as a module (with `type: "module"`), it fails to initialize properly, causing Comlink to not expose the Worker API correctly.

## The Fix

Removed `{ type: 'module' }` from all Worker constructors:

```typescript
// Before (BROKEN)
const worker = new Worker(getParserWorkerUrl(), { type: 'module' });

// After (FIXED)
const worker = new Worker(getParserWorkerUrl());
```

Workers now use **classic script mode**, which correctly executes the bundled IIFE-style code.

## Files Changed

- `src/core/parser/hooks/useParserWorker.ts`
- `src/core/sanitizer/hooks/useSanitizerWorker.ts`
- `src/core/validator/hooks/useValidatorWorker.ts`
- `src/core/transform/hooks/useTransformWorker.ts`
- `src/core/editor/hooks/useEditWorker.ts`

## Why This Happened

The Workers were originally designed to be ES modules (with proper `import`/`export`), but the tsup bundler outputs IIFE-style code even when `format: ['esm']` is specified. The `type: "module"` option was left in the code from when the Workers were expected to be true ES modules.

## Impact

**Before (v1.0.2 - v1.0.5):**

- ❌ All CSV and XLSX imports failed
- ❌ Error: `PARSER_FAILED: "t.load is not a function"`
- ❌ Workers could not be initialized
- ❌ Core functionality completely broken

**After (v1.0.6):**

- ✅ Workers initialize correctly
- ✅ CSV and XLSX parsing works
- ✅ All Worker APIs (load, parseAll, etc.) are accessible
- ✅ Core functionality restored

## Testing

All existing tests pass with this fix:

- ✅ 73 test suites
- ✅ 411 tests
- ✅ 92.92% coverage (above 90% threshold)

## For Consumers

If you were experiencing the `"t.load is not a function"` or `"r.load is not a function"` error:

**Update to v1.0.6:**

```bash
npm install @cristianmpx/react-import-sheet-headless@1.0.6
```

Your existing code should work without any changes. The fix is internal to the Worker initialization.

## Technical Details

### Worker Bundle Format

The tsup bundler creates Workers in IIFE format:

```javascript
var wf=Object.create;
var qa=Object.defineProperty;
// ... bundled dependencies (papaparse, xlsx, comlink, js-sha256) ...
var Jp={
  async load(e,t={}){...},
  async parseAll(e){...}
};
wa(Jp); // wa is Comlink.expose
```

This is valid JavaScript but **NOT** a valid ES module (no `import`/`export`).

### Browser Behavior

When you create a Worker with `type: "module"`:

- The browser expects ES module syntax
- It looks for `import`/`export` statements
- If the code doesn't have these, the module loader fails
- Comlink.expose may not execute properly
- The Worker API is never exposed

When you create a Worker **without** `type: "module"` (classic script mode):

- The browser executes the code as a regular script
- IIFE/CommonJS style code works correctly
- Comlink.expose executes and exposes the API
- Everything works as expected

## Lessons Learned

1. **Verify Worker bundle format:** Always check if the bundled Worker is actually an ES module before using `type: "module"`
2. **Test with consumers:** Integration tests should verify the library works when consumed as an npm package, not just in the source repo
3. **Monitor bundler output:** The `format: ['esm']` option in tsup doesn't guarantee true ES module output for Workers

## Related Issues

This fix resolves the bug reported in:

- User bug report: `"t.load is not a function"` (v1.0.5)
- Previous bug report: `"r.load is not a function"` (v1.0.2)

The variable name changed between versions due to different minification, but the root cause was the same.
