# How to: Sanitizer

The Sanitizer runs **after Convert** and **before Validator**. It receives **ConvertedSheet** and **SheetLayout**, runs cell → row → sheet sanitizers in a **Web Worker**, and produces **SanitizedSheet**: values cast by `valueType`, normalized by sanitizers, and rows discarded when a row-sanitizer returns `null`.

## Flow position

**Parser → Convert → Sanitizer → Validator → Transform**

The Validator always receives **SanitizedSheet** (typed, cleaned data). Sanitizers do not add errors; they normalize and may discard rows.

## Layout configuration

In **SheetLayout** you can set:

- **`fields[].sanitizers`** — run per cell (e.g. `['trim']`).
- **`rowSanitizers`** — run per row; return `null` to **discard** that row.
- **`sheetSanitizers`** — run once after all rows (sheet-level).

Each entry is a string id (e.g. `'trim'`) or `{ name: 'id', params?: {...} }`. Sanitizers are resolved by id from the registry (built-in or registered via **`registerSanitizer`**).

## Adding your own vs using built-in

- **Use built-in sanitizers:** Register them with the Provider’s **`registerSanitizer`** (from **`useImporter()`**). For example, call **`registerTrimSanitizer(registerSanitizer)`** once, then use the id **`'trim'`** in your layout. See [Sanitizers reference](sanitizers.md) for the list and compatibility table.
- **Add your own sanitizers:** Implement a cell/row/sheet sanitizer function and register it with **`registerSanitizer('myId', mySanitizerFn, { type: 'cell' | 'row' | 'table' })`**. Use **`'myId'`** (or `{ name: 'myId', params }`) in the layout. The Worker resolves by id from the same registry.

So you can either **add the sanitizers you need** (custom or from the lib) or **register the predefined ones** and reference them by id in the layout. Same pattern as [Validators](how-to-validators.md) and [Transformers](how-to-transformers.md).

## Value type casting

Before any cell sanitizers, the Sanitizer casts each cell value by the field’s **`valueType`** (`'number' | 'string' | 'bool' | 'date'`). The Validator then receives typed values, not raw `unknown`.

## Built-in sanitizers

All built-in sanitizers are **cell-level** and are registered automatically in the Worker registry. Use their ids in **`fields[].sanitizers`** (e.g. `['trim', 'number', 'string:minusculas']`). Those that accept options use **params** in the layout: `{ name: 'number:toStringId', params: { length: 4, fill: '0' } }`.

- **`trim`** — trim string; null/undefined → `''`.
- **`number`** — digits only, output integer. **`float`** — numeric only, output float.
- **`number:toStringId`** / **`number:toStringEnd`** — pad numeric at start or end (params: `length`, `fill`).
- **`data`** — formatted date+time. **`data:year`** — year only. **`data:data`** — date only (YYYY-MM-DD). **`data:time`** — time only (HH:MM:SS). **`data:timestamp`** — Unix timestamp.
- **`string:minusculas`** / **`string:mayusculas`** — lowercase / uppercase.
- **`string:maxLength`** — truncate (param: `maxLength`). **`string:trimAdd`** / **`string:trimPre`** — pad end/start (params: `length`, `fill`).
- **`string:spaces`** — collapse runs of spaces to one, trim.
- **`nullToEmpty`** — null/undefined → `''`.
- **`replace-from-regex`** — replace by regex (params: `pattern`, `flags?`, `replacement?`). **`replace-from-str`** — replace literal (params: `search`, `replacement?`).

Full list and params: [Sanitizers reference](sanitizers.md).

## Running the Sanitizer

The Sanitizer runs in a **Web Worker** (Comlink). Internal hook **`useSanitizerWorker`** (from `core/sanitizer`) exposes **`sanitize(convertedSheet, sheetLayout, options?, onProgress?)`** returning `Promise<SanitizedSheet>`. Progress is reported via the same **EventTarget** (`importer-progress`). The Provider holds **`sanitizedSheet`** and **`setSanitizedSheet`**; after Convert, the pipeline runs the sanitizer and sets the result so the Validator uses it.

## See also

- [How to: Column mapping (Convert)](how-to-convert.md) — Produces `convertedSheet` which is the input to the Sanitizer.
- [How to: Validators](how-to-validators.md) — Consumes `sanitizedSheet`.
- [Sanitizers reference](sanitizers.md) — Compatibility table and layout fields.
- Architecture — Data flow (Convert → Sanitizer → Validator), Registry pattern, Sync Row Loop.
