# Implementation guide for external projects — react-import-sheet-headless

**Purpose:** This document is the single reference for an external AI (or developer) integrating this headless library into another project. Read it to: **integrate the provider and hooks**, **implement custom controllers** (validators, sanitizers, transforms), and **consume results** (sheet, errors, edit, view, export, persist). Do not rely on internal implementation details; use only the public API and contracts below.

---

## 1. Integrating the headless in your project

### 1.1 Setup

1. **Wrap** the part of the app where import happens with **`ImporterProvider`**.
2. **Optional:** Pass **`layout`** and/or **`engine`** as Provider props, or pass them later via **`useImporter({ layout, engine })`**.
3. **Engine:** `'xlsx' | 'csv' | 'auto'`. Omit or use `'auto'` for automatic format detection from file extension/MIME.

```tsx
import {
  ImporterProvider,
  useImporter,
  useImporterStatus,
  useSheetData,
} from 'react-import-sheet-headless';

function App() {
  return (
    <ImporterProvider>
      <ImportFlow />
    </ImporterProvider>
  );
}
```

### 1.2 Flow (order of operations)

1. User selects a file → call **`processFile(file)`** (from **`useImporter()`**). Parser runs (Worker); you get raw data and status updates.
2. Optionally call **`startFullImport()`** (from **`useImportSheet()`**) to parse the full file after a preview.
3. Call **`convert(options?)`** (from **`useConvert()`**) to align file headers to your **SheetLayout**. You get either **`convertedSheet`** or **`convertResult`** (mapping UI: reorder/rename columns, then **`applyMapping()`**). **ConvertOptions** may include **`fuzzyHeaders`** (boolean, default **false**) to match similar headers (e.g. "Nombre" → "Name") and **`fuzzyThreshold`** (0–1, default 0.8 when fuzzy is on).
4. After Convert, the library runs **Sanitizer → Validator → Transform** in order (all in Workers). No extra calls needed; progress and completion are reflected in **`status`** and **`useSheetData()`**.
5. Consume the result with **`useSheetData()`** (sheet + errors), **`useSheetEditor()`** (editCell, pageData), or **`useSheetView()`** (pagination, filter, export, persist).

### 1.3 Hooks you will use

| Hook                                                         | Use for                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`useImporter({ layout?, engine? })`**                      | **`processFile(file)`**, **`abort()`**, **`metrics`** (PipelineMetrics \| null), **`registerValidator`** / **`registerSanitizer`** / **`registerTransform`**.                                                                                                                                                       |
| **`useImportSheet()`**                                       | **`startFullImport()`** after preview.                                                                                                                                                                                                                                                                              |
| **`useConvert()`**                                           | **`convert()`**, **`convertedSheet`**, **`convertResult`** (column mapping).                                                                                                                                                                                                                                        |
| **`useImporterStatus()`**                                    | **`status`**, subscribe to progress (EventTarget: `importer-progress`, `importer-aborted`).                                                                                                                                                                                                                         |
| **`useSheetData()`**                                         | **`sheet`**, **`errors`** (for table rendering).                                                                                                                                                                                                                                                                    |
| **`useSheetEditor({ page?, pageSize?, debounceMs? })`**      | **`sheet`**, **`editCell({ rowIndex, cellKey, value })`**, **`pageData`**, **`totalPages`**.                                                                                                                                                                                                                        |
| **`useSheetView({ page?, defaultPageSize?, filterMode? })`** | Pagination, **filterMode** (all \| errors-only), **totalRows** / **getRows(page, limit)** (page 1-based; virtualization), **exportToCSV** / **exportToJSON** / **downloadCSV** / **downloadJSON**, **hasRecoverableSession** / **recoverSession** / **clearPersistedState** (when Provider has **persist={true}**). |

---

## 2. Implementing controllers in your project

Controllers are **validators**, **sanitizers**, and **transforms**. They run in **Web Workers**; the layout references them by **string id** (or `{ name, params }`). You **register** implementations with the Provider; the layout only contains ids.

### 2.1 Registry and layout

- **Register** before or when building the layout: **`registerValidator(id, fn, { type })`**, **`registerSanitizer(id, fn, { type })`**, **`registerTransform(id, fn, { type })`**.
- **`type`** is **`'cell' | 'row' | 'table'`**. Cell = per cell; row = per row; table = once per sheet (table may be async).
- In **SheetLayout**, reference by **id** or **`{ name: 'id', params?: { ... } }`**. Params are passed to your function at runtime (use params for configuration; do not close over external data).

### 2.2 Validators

- **Purpose:** Check validity; return errors (or null if valid). Do not mutate data.
- **Cell validator:** `(value: unknown, row, params?) => readonly SheetError[] | null`. **Row** is the current row (read-only). Return **`null`** when valid.
- **Row validator:** receives row (and optionally full sheet context depending on implementation). Same return: **SheetError[] | null**.
- **Table validator:** runs once with full sheet; may be **async** (e.g. backend check). On failure return **SheetError[]**; on network/backend failure the library uses **`EXTERNAL_VALIDATION_FAILED`**.
- **Error shape:** **`{ code: string; params?: Record<string, unknown>; level?: 'error'|'warning'|'fatal'|'info'; message?: string; rowIndex?: number; cellKey?: string }`**. The UI translates by **code** and **params** (I18n); **message** is optional fallback. **rowIndex** and **cellKey** are optional and indicate where the error is: sheet-level errors can set them to point to a row/cell; row-level errors can set **cellKey** so the error is applied to that cell.

Example (cell, required):

```ts
function myRequired(value: unknown, _row: unknown, _params?: Record<string, unknown>) {
  const empty = value == null || (typeof value === 'string' && value.trim() === '');
  return empty ? [{ code: 'REQUIRED', level: 'error', params: { value } }] : null;
}
// Register: registerValidator('required', myRequired, { type: 'cell' });
// Layout:  validators: ['required'] or validators: [{ name: 'required' }]
```

### 2.3 Sanitizers

- **Purpose:** Normalize or clean values (trim, cast, discard row). Do not add errors; return the (possibly modified) cell/row/sheet.
- **Add your own or use built-in:** Register custom sanitizers with **`registerSanitizer(id, fn, { type })`**, or register the library’s built-in ones (e.g. **`registerTrimSanitizer(registerSanitizer)`**) and use their id (e.g. **`'trim'`**) in the layout. Same pattern as validators and transforms.
- **Cell sanitizer:** receives **cell** (key + value), **row**, **params?**; returns the **cell** (same shape, possibly new value).
- **Row sanitizer:** receives row (and context); return **null** to **discard** that row, or the row otherwise.
- **Table sanitizer:** runs once; returns the (possibly modified) sheet.
- Before any cell sanitizers, the library casts by **`valueType`** (`'number'|'string'|'bool'|'date'`) from **SheetLayoutField**; validators then see typed values.

Example (cell, trim):

```ts
function myTrim(
  cell: { key: string; value: unknown },
  _row: unknown,
  _params?: Record<string, unknown>
) {
  const v = cell.value;
  const s = v == null ? '' : typeof v === 'string' ? v : String(v);
  return { key: cell.key, value: s.trim() };
}
// Register: registerSanitizer('trim', myTrim, { type: 'cell' });
// Layout:  sanitizers: ['trim']
```

### 2.4 Transforms

- **Purpose:** Change values (e.g. format, uppercase). Run only where there are **no errors** (safe-first: sheet/row/cell with errors are skipped).
- **Cell transform:** `(value: unknown, cell, row, params?) => unknown` (return the new value).
- **Row/table transform:** same idea; table may be **async**. On async failure the library uses **`EXTERNAL_TRANSFORM_FAILED`**.
- Transforms do not add validation errors; they only change values.

Example (cell, toUpperCase):

```ts
function toUpper(value: unknown, _cell: unknown, _row: unknown, _params?: Record<string, unknown>) {
  return typeof value === 'string' ? value.toUpperCase() : value;
}
// Register: registerTransform('toUpperCase', toUpper, { type: 'cell' });
// Layout:  transformations: ['toUpperCase']
```

### 2.5 Controller rules (critical)

- **Pure and Worker-safe:** No `window`, `document`, `localStorage`, `sessionStorage`. No closures over non-serializable data; pass config via **`params`** in the layout.
- **Cell and row:** Must be **synchronous**. Only **table** validators/transforms may be **async**.
- **Layout uses ids only:** Never pass function references in the layout; only string ids or `{ name, params }`.

---

## 3. Consuming results and other functions

### 3.1 Result: sheet and errors

- **`useSheetData()`** returns **`sheet`** (final **Sheet**) and **`errors`** (derived from the sheet).
- **Sheet:** `headers`, **`rows`** (each row: **`index`**, **`errors`**, **`cells`**). Each cell: **`key`**, **`value`**, **`errors`**.
- **Errors:** **`sheet.errors`** (sheet-level), **`row.errors`** (per row), **`cell.errors`** (per cell). All are **`readonly SheetError[]`** with **`code`**, **`params?`**, **`level?`**, **`message?`**. Translate in your UI by **code** and **params**.

### 3.2 Editing cells (after import)

- **`useSheetEditor({ page, pageSize, debounceMs? })`** → **`editCell({ rowIndex, cellKey, value })`**.
- **`rowIndex`** is the **global** row index (e.g. **`row.index`**), not the index within the page. **`cellKey`** must match a field key in your **SheetLayout**.
- Each edit runs a scoped validate + transform pipeline in a Worker and updates the result. Use **`debounceMs`** to avoid running on every keystroke, or call **`editCell`** on **onBlur** without debounce.

### 3.3 View: pagination, filter, export, persist

- **`useSheetView({ page, defaultPageSize, filterMode? })`** composes the editor and adds:
  - **Pagination:** **`page`**, **`setPage`**, **`pageSize`**, **`getPaginatedResult(page?, pageSize?)`**, **`paginatedRows`**.
  - **Virtualization:** **`totalRows`**, **`getRows(page, limit)`** (page 1-based) for virtual lists.
  - **Filter:** **`filterMode: 'all' | 'errors-only'`**; **`rowsWithErrors`**, **`counts`** (e.g. totalRows, rowsWithErrors, totalErrors).
  - **Export:** **`exportToCSV`** / **`exportToJSON`** (string), **`downloadCSV`** / **`downloadJSON`** (trigger download, BOM for CSV).
  - **Persist:** When **ImporterProvider** has **persist={true}**: **`hasRecoverableSession`**, **`recoverSession()`**, **`clearPersistedState()`** (IndexedDB, 7-day expiry). Show a “Continue?” prompt and call recover or clear.

---

## 4. Data contracts (summary)

### 4.1 SheetLayout

- **`name`**, **`version`** (string or number), **`fields`** (Record of **SheetLayoutField**).
- **Per field:** **`name`**, **`validators?`**, **`sanitizers?`**, **`transformations?`** (each: string id or **`{ name, params? }`**), **`valueType?`** (`'number'|'string'|'bool'|'date'`), **`inputType?`** (`'input'|'checkbox'`), **`required?`** (boolean; default **true** when omitted).
- **Sheet/row level:** **`sheetValidators`**, **`sheetSanitizers`**, **`rowValidators`**, **`rowSanitizers`**, **`rowTransformations`**, **`sheetTransformations`**.

### 4.2 Convert: required columns and extra columns

- **Extra document columns** are ignored: only columns that map to a layout field are used; unmapped file columns do not appear in **ConvertedSheet** and are not an error.
- **Required columns:** Every layout field with **`required !== false`** must be mapped (by name or via **headerToFieldMap**). If any required field has no mapping, conversion returns **convertResult** (kind **`'mismatch'`**) with **`layoutError: true`** and **mismatches** listing missing columns; each **ColumnMismatch** has **`required?: boolean`** so the UI can distinguish required vs optional.
- **Optional columns:** Layout fields with **`required: false`** may be missing in the file; conversion can still succeed and the converted sheet will have those cells as **null**.
- **Insufficient columns:** If the document has fewer columns than required layout fields (e.g. 3 file columns and 5 required layout fields), it is a **layout error** (**layoutError: true**); the user must provide a file with enough columns or adjust the layout.

### 4.3 Pipeline (fixed order)

**Parser → Convert → Sanitizer → Validator → Transform.** Then optional Edit and View. Do not reorder or skip steps.

### 4.4 Metrics (telemetry)

After a full pipeline run (parse → … → transform), **`useImporter().metrics`** is set to **`PipelineMetrics`** (or **`null`** until the first successful run). It includes **`timings`** (parse, sanitize, validate, transform in ms), **`totalMs`**, **`isSlow`**, **`percentages`**, **`efficiency`** (ms/row), **`rowCount`**, and formatted strings (**`parseTime`**, **`totalTime`**, etc.).

---

## 5. Safety and public API

- **Heavy work in Workers only.** Parser, Sanitizer, Validator, Transform (and edit pipeline) run in Web Workers. Do not move them to the main thread.
- **Import only from the package barrel.** Only exported symbols are part of the contract; internal types and modules are not. When in doubt, the package entry (e.g. `src/index.ts`) is the source of truth for what you can use.

---

## 6. References (inside this repo)

- **Architecture and flow:** `.cursor/docs/Architecture.md`
- **Per-topic how-to:** `docs/how-to.md`, `docs/how-to-validators.md`, `docs/how-to-sanitizer.md`, `docs/how-to-transformers.md`, `docs/how-to-convert.md`, `docs/how-to-parser.md`, `docs/how-to-edit.md`, `docs/how-to-view.md`
- **Controller reference tables:** `docs/validators.md`, `docs/sanitizers.md`, `docs/transformers.md`

When you change a **public hook**, a **data type** in the external API, or **pipeline behaviour** in core, update this file so the implementation guide stays accurate for external projects.
