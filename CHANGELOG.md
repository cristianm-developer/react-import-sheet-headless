# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
