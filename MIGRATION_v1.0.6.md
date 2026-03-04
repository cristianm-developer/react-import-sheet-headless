# Migration Guide: v1.0.5 → v1.0.6

**Date:** 2026-03-04  
**From:** v1.0.2, v1.0.3, v1.0.4, or v1.0.5  
**To:** v1.0.6

---

## Summary

Version 1.0.6 fixes a critical bug where Workers failed to initialize, causing the error `"t.load is not a function"` when parsing CSV or XLSX files.

**Good news:** This is a **zero-breaking-change update**. No code changes are required on your side.

---

## Update Instructions

### 1. Update the Package

```bash
npm install @cristianmpx/react-import-sheet-headless@1.0.6
```

Or if using yarn:

```bash
yarn upgrade @cristianmpx/react-import-sheet-headless@1.0.6
```

### 2. Rebuild Your Application

```bash
npm run build
```

Or if using a dev server:

```bash
npm run dev
```

### 3. Test

Your existing code should work without any changes. Test your import flow:

1. Select a CSV or XLSX file
2. Verify `status` changes from `idle` → `loading` → `success` (not `error`)
3. Verify `convertResult` or `sheet` appears
4. Verify no `PARSER_FAILED` errors in `useSheetData().errors`

---

## What Changed Internally

### Worker Initialization

**Before (v1.0.2 - v1.0.5):**

```typescript
const worker = new Worker(getParserWorkerUrl(), { type: 'module' });
```

**After (v1.0.6):**

```typescript
const worker = new Worker(getParserWorkerUrl());
```

This change is **internal** to the library. Your code that uses the hooks doesn't need to change.

---

## Breaking Changes

**None.** This is a bug fix with no breaking changes.

---

## What If I'm Still Getting Errors?

If you're still experiencing issues after updating to v1.0.6:

1. **Clear your node_modules and reinstall:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear your build cache:**

   ```bash
   # Vite
   rm -rf node_modules/.vite

   # Webpack
   rm -rf node_modules/.cache
   ```

3. **Verify the version:**

   ```bash
   npm list @cristianmpx/react-import-sheet-headless
   ```

   Should show: `@cristianmpx/react-import-sheet-headless@1.0.6`

4. **Check for multiple versions:**

   ```bash
   npm ls @cristianmpx/react-import-sheet-headless
   ```

   If you see multiple versions (e.g., due to peer dependencies), you may need to dedupe:

   ```bash
   npm dedupe
   ```

5. **Report the issue:**
   If you're still experiencing problems, please open an issue with:
   - The error message and stack trace
   - Your environment (React version, bundler, browser)
   - A minimal reproduction if possible

---

## Verification

After updating, you should see:

### Before (v1.0.5)

```
Status: idle → loading → error ❌
Errors: [{ code: "PARSER_FAILED", message: "t.load is not a function" }]
```

### After (v1.0.6)

```
Status: idle → loading → success ✅
convertResult: { headersFound: [...], mismatches: [] }
```

---

## Additional Resources

- **Full Changelog:** See `CHANGELOG.md` for all changes
- **Technical Details:** See `BUG_FIX_v1.0.6.md` for in-depth analysis
- **Bug Report Response:** See `RESPONSE_TO_BUG_REPORT_v1.0.6.md` for the full investigation

---

## Questions?

If you have any questions or need help with the migration, please:

- Open an issue on GitHub
- Check the documentation at `docs/how-to.md`
- Review the error codes at `docs/error-codes.md`

---

**Thank you for your patience while we fixed this critical bug!**
