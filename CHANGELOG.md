# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
