# How to: Sanitizer

The Sanitizer runs **after Convert** and **before Validator**. It receives **ConvertedSheet** and produces **SanitizedSheet**: values cast by `valueType`, normalized by cell/row/sheet sanitizers, and rows discarded when a row-sanitizer returns `null`.

## Flow position

**Parser → Convert → Sanitizer → Validator → Transform**

The Validator always receives **SanitizedSheet** (typed, cleaned data). Sanitizers do not add errors; they normalize and may discard rows.

## Layout configuration

In **SheetLayout** you can set:

- **`sheetSanitizers`** — run once after all rows (sheet-level).
- **`rowSanitizers`** — run per row; return `null` to **discard** that row.
- **`fields[].sanitizers`** — run per cell (with row context); e.g. `['trim']`.

Each entry is a string id (e.g. `'trim'`) or `{ name: 'id', params?: {...} }`. Sanitizers are resolved by id from the registry (built-in or registered via `registerSanitizer`).

## Value type casting

Before any cell sanitizers, the Sanitizer casts each cell value by the field’s **`valueType`** (`'number' | 'string' | 'bool' | 'date'`). So the Validator receives typed values, not raw `unknown`.

## Built-in sanitizers

- **`trim`** (cell): trims string values. Register with `registerTrimSanitizer(registerSanitizer)` or use id `'trim'` in layout if the worker’s built-in registry is used.

## Running the Sanitizer

The Sanitizer runs in a **Web Worker** (Comlink). Internal hook **`useSanitizerWorker`** (from `core/sanitizer`) exposes **`sanitize(convertedSheet, sheetLayout, options?, onProgress?)`** returning `Promise<SanitizedSheet>`. Progress is reported via the same **EventTarget** (`importer-progress`). The Provider holds **`sanitizedSheet`** and **`setSanitizedSheet`** in context; after `convert()` you can run the sanitizer and set the result so the next step (Validator) uses it.

## See also

- [How to: Column mapping (Convert)](how-to-convert.md) — Produces `convertedSheet` which is the input to the Sanitizer.
- Architecture — Data flow (Convert → Sanitizer → Validator), Registry pattern, Sync Row Loop.
