# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-04

### 🚀 BREAKING CHANGES

- **Removed Web Workers:** All processing now runs on the main thread
  - Eliminates all worker-related complexity (Blob URLs, Comlink, worker management)
  - Fixes all worker-related bugs (`"t.load is not a function"`, cache issues, etc.)
  - Simplifies build process (no more `inline-workers.mjs` script)
  - Works out-of-the-box with all bundlers and frameworks (no special configuration needed)
  - **Trade-off:** For very large files (>10,000 rows), the UI may freeze briefly during processing

### Removed

- Removed `comlink` dependency
- Removed all `*.worker.ts` files
- Removed all `worker-url.ts` files
- Removed `scripts/inline-workers.mjs`
- Removed `setActiveWorker` from Provider API
- Removed worker-related build configuration from `tsup.config.ts`

### Changed

- All hooks now call runner functions directly instead of through workers:
  - `useParserWorker` → calls `parseSheet` directly
  - `useSanitizerWorker` → calls `runSanitization` directly
  - `useValidatorWorker` → calls `runValidation` directly
  - `useTransformWorker` → calls `runTransform` directly
  - `useEditWorker` → calls `runEditPipeline` directly
- Simplified build script: `tsup --minify` (no more double build)
- Updated documentation to reflect main-thread architecture

### Fixed

- Eliminates all Blob URL worker issues
- No more Vite optimization conflicts
- No more cache corruption issues
- No more `globalThis` vs `self` problems

### Migration Guide

**No code changes required!** The public API remains the same. Simply:

1. Update to v2.0.0: `npm install @cristianmpx/react-import-sheet-headless@2.0.0`
2. Remove any Vite `optimizeDeps.exclude` configuration (no longer needed)
3. Clear caches: `rm -rf node_modules/.vite .vite`
4. Rebuild and test

**Note:** If you process very large files (>10,000 rows), you may notice a brief UI freeze during processing. For most use cases (<5,000 rows), performance is identical.

## [1.0.7] - 2026-03-04

### Fixed

- **Critical:** Added explicit `self` parameter to all `Comlink.expose()` calls in workers
  - Changed from `Comlink.expose(api)` to `Comlink.expose(api, self)`
  - This ensures workers created from Blob URLs properly register their API with Comlink
  - Fixes the persistent `"t.load is not a function"` error that occurred even in v1.0.6
  - Affects all workers: parser, sanitizer, validator, transform, and editor

### Technical Details

**Root Cause:** When `Comlink.expose(api)` is called without the second parameter, Comlink uses `globalThis` as the default endpoint. In workers created from Blob URLs (as opposed to separate .js files), `globalThis` may not be properly initialized or may point to the wrong context, causing the worker's API to not be exposed correctly to the main thread.

**Solution:** Explicitly pass `self` as the second parameter to `Comlink.expose()`. In Web Workers, `self` is the proper reference to the WorkerGlobalScope and ensures Comlink registers the API on the correct endpoint.

**Impact:** This fixes the critical bug where `Comlink.wrap(worker)` would return a proxy without methods, causing `"t.load is not a function"` errors when trying to call worker methods.

### Documentation

- Updated README with Vite/Storybook configuration requirements
- Added `docs/troubleshooting-vite.md` for Vite-specific issues
- Added troubleshooting guides for consumers

## [1.0.6] - 2026-03-04

### Fixed

- **Critical:** Fixed Worker initialization issue that caused `"t.load is not a function"` error
  - Removed `type: "module"` from all Worker constructors
  - The bundled Workers are not ES modules (they use IIFE/CommonJS style), but were being created with `type: "module"` which caused the browser to fail loading them
  - This fix resolves the `PARSER_FAILED` error that prevented CSV and XLSX files from being processed
  - Affects all Workers: parser, sanitizer, validator, transform, and editor

### Technical Details

**Root Cause:** The Workers were being created with `new Worker(url, { type: "module" })`, but the bundled worker code (from tsup) is not a proper ES module - it doesn't have `import`/`export` statements. When the browser tries to execute non-module code as a module, it fails silently or throws errors, causing Comlink to not properly expose the Worker API.

**Solution:** Removed the `{ type: "module" }` option from all Worker constructors. Workers now use classic script mode, which correctly executes the bundled IIFE-style code.

**Impact:** This fixes the critical bug reported in versions 1.0.2-1.0.5 where CSV parsing failed with `"r.load is not a function"` (v1.0.2) or `"t.load is not a function"` (v1.0.5).

### Known Issues & Workarounds

- **Vite/Storybook users:** If you encounter `"t.load is not a function"` error even after updating to v1.0.6, you need to **exclude this library from Vite's dependency optimization**. This is a known Vite issue with libraries that use Blob URL-based workers.
  - **Root cause:** Vite's `optimizeDeps` pre-bundles dependencies and breaks Blob URL worker resolution
  - **Solution:** Add `optimizeDeps: { exclude: ['@cristianmpx/react-import-sheet-headless'] }` to your `vite.config.ts`
  - See `docs/troubleshooting-vite.md` for detailed instructions

### Documentation

- Added comprehensive bug fix documentation:
  - `BUG_FIX_v1.0.6.md` - Technical analysis
  - `RESPONSE_TO_BUG_REPORT_v1.0.6.md` - Detailed response
  - `MIGRATION_v1.0.6.md` - Migration guide
  - `SUMMARY_v1.0.6_FIX.md` - Executive summary
  - `TROUBLESHOOTING_v1.0.6.md` - Troubleshooting steps
  - `VERIFY_FIX_IN_CONSUMER.md` - Verification guide
  - `docs/troubleshooting-vite.md` - Vite/Storybook specific troubleshooting and configuration

## [1.0.5] - 2026-03-04

### Fixed

- **Critical:** Fixed Worker loading issue when library is consumed as npm package
  - Workers are now inlined as Blob URLs instead of using `import.meta.url` for file resolution
  - This fixes the `"r.load is not a function"` error that occurred when the library was used in consuming applications
  - The error was caused by `import.meta.url` resolving relative to the consumer's bundle context, not the library's dist folder
  - Workers now load correctly in all environments (Vite, Webpack, Rollup, etc.)

### Changed

- Updated tsup configuration to disable code splitting and bundle all dependencies into Workers
- Workers are now self-contained (no dynamic imports) and larger (parser.worker.js is now ~369 KB instead of ~2 KB)
- Added post-build script (`scripts/inline-workers.mjs`) that inlines Worker code as strings
- Updated all `worker-url.ts` files to create Blob URLs from inlined Worker code
- Updated worker-url tests to expect Blob URLs instead of file paths
- Main bundle size increased from ~20 KB to ~421 KB due to inlined Workers

### Technical Details

**Root Cause:** When the library was consumed as an npm package, the Worker URL resolution using `new URL('./parser.worker.js', import.meta.url)` failed because `import.meta.url` pointed to the consumer's bundle location, not the library's `dist` folder. This caused Workers to fail to load, resulting in the error `"r.load is not a function"` when trying to call Worker methods.

**Solution:** Workers are now bundled as self-contained files (no code splitting), then inlined as strings in the source code during the build process. At runtime, the library creates Blob URLs from these strings, which works correctly in all environments regardless of the consumer's bundler or module resolution strategy.

**Trade-off:** The main bundle is now larger (~421 KB vs ~20 KB), but this ensures the library works correctly when consumed as a dependency. The Workers are loaded lazily (only when needed), so the initial bundle size impact is acceptable for a library that handles file parsing and validation.

## [1.0.4] - 2026-03-04

### Fixed

- **Critical:** Fixed error information not being exposed when status transitions to `error`
  - Added `globalErrors` field to `ImporterState` to store fatal/global errors (parser failures, worker crashes, etc.)
  - Updated `useSheetData()` to return both global errors and sheet errors in the `errors` array
  - Updated `useImportSheet` to populate `globalErrors` with detailed error information when parsing fails
  - Added error codes: `PARSER_FAILED`, `PARSER_NO_SHEETS`, `PARSER_SHEET_ACCESS_FAILED`
  - Error objects now include `code`, `level`, `message`, and `params` for better debugging

### Added

- `setGlobalErrors()` action in ImporterContext to set global errors
- Comprehensive error handling in parser with structured error objects
- Tests for global error handling in `useSheetData` and `useImportSheet`

## [1.0.3] - 2026-03-03

### Added

- Initial release with core functionality
- Parser, Sanitizer, Validator, Transform pipeline
- Web Worker support for heavy operations
- Provider and hooks architecture
- CSV and XLSX support
