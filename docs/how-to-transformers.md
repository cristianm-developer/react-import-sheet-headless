# How to: Transformers

The Transform step runs **after Validator**. It receives the validated **Sheet** and **SheetLayout**, runs cell → row → sheet transforms in a **Web Worker**, and returns only a **delta of value changes** (not the full sheet). The main thread applies the delta to produce the final sheet with transformed values.

## Flow position

**Parser → Convert → Sanitizer → Validator → Transform**

Transform runs only where there are **no errors**: if the sheet has sheet-level errors, no transforms run; if a row has errors, that row is skipped; if a cell has errors, that cell is not transformed (safe-first).

## Layout configuration

In **SheetLayout** you can set:

- **`fields[].transformations`** — run per cell (e.g. `['toUpperCase', 'formatCurrency']`).
- **`rowTransformations`** — run per row after cell transforms.
- **`sheetTransformations`** — run **once** at the end with the full transformed dataset; these may be **async** (e.g. call to backend).

Each entry is a string id or `{ name: 'id', params?: {...} }`. Transforms are resolved by id from the registry (built-in or registered via **`registerTransform`**).

## Sync vs async

- **Cell and row transforms** are **strictly synchronous** for performance.
- **Sheet (table) transforms** may be **async** (e.g. one batched request). On failure the runner returns **`EXTERNAL_TRANSFORM_FAILED`** with optional `params: { reason: 'network' | 'timeout' | 'server_error' }`.

## Delta strategy

The Worker **does not** return the full sheet. It returns **TransformResult**: `{ deltas: [{ row, col, newValue }, ...], errors?: SheetError[] }`. The main thread applies deltas with **`applyTransformDelta(sheet, { deltas })`** and merges any sheet-level **errors** from async transforms into the sheet.

## Built-in transforms

All built-in transforms are **cell-level**. Use **`CellXTransform.Register(registerTransform)`** in the layout or register manually with **`registerTransform(id, fn, { type: 'cell' })`**. Full list and params: [Transformers reference](transformers.md).

- **String:** `toUpperCase`, `toLowerCase`, `slice`, `replace`, `replaceByRegex`, `fillStart`, `fillEnd`, `extractByRegex`
- **Number:** `numberAdd`, `numberMultiply`, `numberDivide`, `numberSubtract`, `numberRound` (mode: round/ceil/floor), `numberAbs`, `numberSqrt`, `numberLimit` (min/max clamp), `numberPercent` (param: total)
- **Date:** `dateToOnlyTime`, `dateToOnlyDate`, `dateToTimeDate`, `dateToUtc`, `dateLimit` (min/max), `dateAdd`, `dateSubtract` (params: days, hours, minutes, seconds, ms, months, years)

## Running the Transform

Transform runs in a **Web Worker** (Comlink). Internal hook **`useTransformWorker`** (from `core/transform`) exposes:

- **`transform(sheet, sheetLayout, options?, onProgress?)`** — returns `Promise<TransformResult>`.
- **`transformAndApply(sheet, options?, onProgress?)`** — runs transform, applies delta (and any sheet errors), and calls **`setResult(patchedSheet)`** using the Provider’s layout.

Progress is reported via the same **EventTarget** (`importer-progress` with `phase: 'transforming'`). **`abort()`** terminates the worker and passes an AbortSignal to async sheet transforms.

## See also

- [How to: Validators](how-to-validators.md) — Produces the validated sheet which is the input to Transform.
- Architecture — Data flow, Registry pattern, Sync Row Loop → Async Table Check, Delta strategy.
