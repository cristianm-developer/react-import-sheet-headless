# How to: Validators

The Validator runs **after Sanitizer**. It receives **SanitizedSheet** and **SheetLayout**, runs cell → row → table validators in a **Web Worker**, and returns only a **delta of errors** (not the full sheet). The main thread builds an initial sheet and applies the delta to produce the final **Sheet** with errors attached to cells, rows, or the sheet.

## Flow position

**Parser → Convert → Sanitizer → Validator → Transform**

The Validator consumes **SanitizedSheet** and layout identifiers (e.g. `validators: ['required', 'email']`). Cell and row validators are **synchronous**; only **table** validators may be **async** (e.g. backend integrity checks).

## Layout configuration

In **SheetLayout** you can set:

- **`fields[].validators`** — run per cell (e.g. `['required', 'email']`).
- **`rowValidators`** — run per row after cell validators.
- **`sheetValidators`** — run **once** at the end with the full dataset; these may be **async**.

Each entry is a string id or `{ name: 'id', params?: {...} }`. Validators are resolved by id from the registry (built-in or registered via **`registerValidator`**).

## Error shape (I18n)

Validators must **not** return static message strings. They return **SheetError** objects:

- **`code`** — stable key for translation (e.g. `'REQUIRED'`, `'INVALID_EMAIL'`).
- **`params`** — optional data for the UI (e.g. `{ value, min, actual }`).
- **`level`** — `'error' | 'warning' | 'fatal' | 'info'`.
- **`message`** — optional fallback for debugging; the UI should translate by **code**.
- **`rowIndex`** — optional; for **sheet-level** errors, indicates which row the error refers to (validation runs at sheet level but the error can be scoped to a row).
- **`cellKey`** — optional; for **sheet-level** errors, indicates which cell (together with `rowIndex`); for **row-level** errors, indicates which cell in that row — the error is then applied to that cell instead of the row.

The consumer translates `code` and `params` into localized text. Use `rowIndex` and `cellKey` when present to highlight or show the error next to the specific row/cell.

## Sync vs async

- **Cell and row validators** are **strictly synchronous** for performance (thousands of rows).
- **Table validators** may be **async** (e.g. one batched request to the backend). On network/backend failure the runner returns **`EXTERNAL_VALIDATION_FAILED`** with optional `params: { reason: 'network' | 'timeout' | 'server_error' }`.

## Delta strategy

The Worker **does not** return the full sheet. It returns **ValidatorDelta**: an array of errors with coordinates (rowIndex, cellKey for cell errors; rowIndex for row errors; no coordinates for sheet errors). The main thread:

1. Builds an initial **Sheet** from SanitizedSheet (empty errors).
2. Applies the delta with **`applyValidatorDelta(sheet, delta)`**.
3. Updates the Provider **result** with the patched sheet.

## Built-in validators

- **`required`** (cell): fails when value is null, undefined, or blank string. Use **`CellRequiredValidator.Register(registerValidator)`** in the layout or register manually; id `'required'`.

## Running the Validator

The Validator runs in a **Web Worker** (Comlink). Internal hook **`useValidatorWorker`** (from `core/validator`) exposes:

- **`validate(sanitizedSheet, sheetLayout, options?, onProgress?)`** — returns `Promise<ValidatorDelta>`.
- **`validateAndApply(sanitizedSheet, options?, onProgress?)`** — runs validate, builds initial sheet, applies delta, and calls **`setResult(patchedSheet)`** using the Provider’s layout.

Progress is reported via the same **EventTarget** (`importer-progress`). **`abort()`** terminates the worker and passes an AbortSignal to async table validators so backend requests can be cancelled.

## Early exit

If a validator returns an error with **`level: 'fatal'`**, the runner stops running further validators for that cell or row to save CPU.

## See also

- [How to: Sanitizer](how-to-sanitizer.md) — Produces `sanitizedSheet` which is the input to the Validator.
- Architecture — Data flow, Registry pattern, Sync Row Loop → Async Table Check, Delta strategy.
