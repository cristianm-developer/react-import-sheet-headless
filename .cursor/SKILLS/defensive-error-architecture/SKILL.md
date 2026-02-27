---
name: defensive-error-architecture
description: Enforces defensive boundaries and typed error reporting for a headless library. Use when implementing parsers, sanitizers, or any code that handles external input so failures are converted to SheetError and multiple errors are reported instead of failing fast with one exception.
---

# Defensive Error Architecture

## When This Applies

- Implementing or modifying **parsers** and **sanitizers** (and any code that processes external input)
- Designing error handling and reporting for the pipeline
- Exposing errors to the consumer (sheet.errors, row.errors, cell.errors)

## Assumption: External input is untrusted

Assume **all external inputs are corrupted or malicious**. The library has no control over what the consumer passes (files, options, layout). The app must not crash; it must **report** problems in a structured way.

## Rules

### 1. Defensive boundaries around parsers and sanitizers

- Every **parser** and **sanitizer** (and similar entry points for external data) must be wrapped in a **defensive boundary** (try/catch or equivalent).
- Do **not** let uncaught exceptions bubble up and crash the app. Catch errors and convert them into the library’s error format.

### 2. Use the SheetError format from Architecture.md

- Do not throw **plain strings** or raw `Error` objects to the consumer.
- Convert caught errors into the **SheetError** format (or the standard error shape) defined in **Architecture.md** (e.g. `code`, `message`, `rowIndex`, `cellKey`, etc.).
- Export and use the **SheetError** type so consumers can handle errors in a type-safe way.

### 3. Prefer reporting multiple errors over failing early

- **Prioritize** collecting and **reporting multiple errors** (e.g. per row, per cell) rather than failing fast on the first exception.
- When possible, continue processing (e.g. next row, next cell) and accumulate errors in the sheet structure (sheet.errors, row.errors, cell.errors) or in a delta, so the user sees a full picture instead of a single failure.

## Verification

- [ ] Parsers and sanitizers are inside a defensive boundary (try/catch or equivalent).
- [ ] All reported errors use the **SheetError** (or documented) format from Architecture.md.
- [ ] Design favors **multiple error reporting** over fail-fast with one exception where appropriate.
