# Architecture — react-import-sheet-headless

## Anchors for AI updates (where to insert changes)

When you change the project structure or flow, update this document in these places:

| Change type | Section to update |
|-------------|-------------------|
| **New or renamed folder** (e.g. `src/core/convert`, `src/shared/registry`) | **"Folder structure"** → Root layout tree, Core modules table, Hooks, Barrels. Add the path and responsibility. |
| **Pipeline / data flow change** (e.g. Parser → X → Validator) | **"Design principles → Headless → Data flow"** (one-line flow) and **"Flow summary"** (numbered list). Redraw or adjust the arrow chain. |
| **New core module or responsibility change** | **"Folder structure → Core modules"** table: add row or edit Responsibility column. Update **"Flow summary"** steps. |
| **New shared type or export** | **"Folder structure → Types"** and/or **"Barrels"**; update `src/index.ts` or `src/types/index.ts` description if needed. |
| **New type (where to put it)** | **Shared** → `src/types/<name>.ts` (one file per type). **Context/module-only** → `<module>/types/<name>.ts` (e.g. `ImporterContext/types/`, `core/parser/types/`). Always one type per file; barrel in `types/index.ts`. |
| **Worker timeout / recovery / memory / schema / I18n** | **"Maturity & resilience"**: add or adjust the relevant subsection (timeout & recovery, memory, schema versioning, I18n of errors). |
| **Abort / cancellation / Worker cleanup** | **"Maturity & resilience"** → **"Process Abort & Worker Cleanup"**: abort API, lifecycle cleanup on unmount, state reset, `importer-aborted` event. |
| **Register() pattern or controller interfaces** | **"Utils (controller…)"** → **"Register() pattern"**: add or adjust built-in/custom Register(), interfaces for user-created controllers. |
| **Registry entry type (cell/row/table) or table-level scope/atomicity** | **"Utils (controller…)"** → **"Registry entry type"** and **"Table-level validations"** (scope, output, atomicity). **6. Validator**, **7. Transform** for Runner and atomicity. |
| **Sync vs async (cell/row sync, only table async) or table resilience** | **"Design principles"** → **Data flow** (Sync Row Loop → Async Table Check). **"Utils"** → **Sync vs async** and **Resilience for async table**. **6. Validator**, **7. Transform**: pipeline phases, try/catch, EXTERNAL_* codes, AbortController for fetch. |
| **Backward compatibility (API, types, layout)** | **"Product architecture"** → **Backward compatibility**: compatibility layer, reuse vs new structure, deprecation. |
| **Public vs internal (what to export)** | **"Public API vs internal (infrastructure)"**: what lives in providers/, what is re-exported from index.ts; update table and Barrels if the public surface changes. |
| **User-facing usage (how to use a feature)** | **How-to is split by context:** **(1)** **`docs/how-to.md`** — general usage (setup, flow, Provider, hooks, pipeline). **(2)** **`docs/how-to-<context>.md`** — one file per specific topic (e.g. `how-to-validators.md`, `how-to-layout.md`, `how-to-transformers.md`). When adding/changing a user-facing feature: update the general how-to if the overall flow changes; create or update the **context-specific** how-to for that feature. Internal/implementation-only changes do not require how-to updates. See `.cursor/rules/typescript-standards.mdc` §6 (Documentation Synchronization). |
| **Coverage target or test exclusions** | **"Tests"** section: coverage target (e.g. 90%), exclusions (workers, async hooks without testable logic), and rule that any testable logic must be isolated and tested. Align with `.cursor/rules/typescript-standards.mdc` §3. |
| **New how-to context** (e.g. new feature area) | Create **`docs/how-to-<context>.md`** for that topic; keep **`docs/how-to.md`** for general usage only. Link from general how-to or README if needed. See **"How-to documentation structure"** under Public API vs internal. |

Keep this document the single source of truth for structure and flow. See also `.cursor/rules/typescript-standards.mdc` §6 (Documentation Synchronization).

---

## Language and conventions

- **All code, identifiers, comments, and documentation are in English.**
- This document describes the headless architecture: logic and state only, no UI components in the core.
- **Types:** Shared types live in **`src/types/`**; types used only by one context or module live in **`<module>/types/`** (e.g. `ImporterContext/types/`, `core/parser/types/`). **One type per file**; each file is re-exported from that folder’s `types/index.ts`. See *Folder structure → Types*.

---

## Design principles

### Headless

- **Decoupling:** All module logic is headless; the library actively avoids UI. The consumer provides the UI and uses the provider, hooks, and data/errors/actions exposed by the library.
- **Data flow:** Input File → Parser (Worker) → **Convert** (main thread) → **Sanitizer** (Worker) → **Validator** (Worker: **Sync Row Loop** → **Async Table Check**) → **Transform** (Worker: **Sync Row Loop** → **Async Table Check**) → Result (sheet) + Errors. Optional: Edit (cell-level) on the result. **Convert** aligns raw headers to layout (with reorder/rename APIs on mismatch). **Sanitizer runs before Validator** and follows the same execution order: **cell → row → sheet**. Cell and row steps are **synchronous** for performance; only **table**-level steps may be **async** (e.g. backend integrity checks).
- **Error handling:** If a row or cell fails validation, the process does not stop; errors are collected with row/cell context and exposed in the sheet structure.

### Web Workers and Comlink

- **Worker management:** All heavy steps (Parser, Sanitizer, Validator, Transform) run inside **Web Workers** so the main thread stays responsive. Worker communication is handled via **Comlink** (not raw `postMessage`/`onmessage`).
- **Comlink usage:** In each worker entry file, the worker exposes an API with **`Comlink.expose(api)`**. The main thread wraps the worker with **`Comlink.wrap(worker)`** and calls methods on the returned proxy as async functions (e.g. `await parserWorker.parse(blob, options)`). Progress and callbacks are passed using **`Comlink.proxy(callback)`** when the worker needs to report progress to the main thread.
- **Benefits:** Same mental model across all workers (expose an object with methods; call them from the main thread); type-safe APIs with TypeScript; no manual message-type protocols; progress can be exposed as an optional callback argument (e.g. `parse(blob, options, onProgress?)`).

### Provider as brain, Hooks as interface (no Zustand)

For a pipeline-based headless import library, the **Provider** and **Hooks** work together: the Provider is the **single source of truth** (the "brain"); the Hooks are the **interface** for the consumer (the "nerves"). State is **not** stored in Zustand or any external store; the Provider holds state in React state and uses the browser’s **EventTarget** for high-frequency updates (progress). No Zustand.

**Entry hook parameters (what the user passes)**

The hook that the consumer instantiates to use the library (**`useImporter`**) **must expose as parameters**:

- **`layout`** (optional): **SheetLayout** — column definitions, validators, sanitizers, transforms. Passed into the Provider and used by Convert, Sanitizer, Validator, Transform. Can also be set via the Provider’s initial `layout` prop.
- **`engine`** (optional): **ParserEngine** — `'xlsx' | 'csv' | 'auto'`. Which engine to use to decode the uploaded file. When **omitted or `'auto'`**, the parser **automatically** detects format from file extension or MIME. When set to **`'xlsx'`** or **`'csv'`**, that engine is used directly (useful for misnamed files or when extension is missing). Can also be set via the Provider’s initial `engine` prop.

**Provider: the brain (Single Source of Truth)**

The Provider wraps the section of the app where import happens. It:

- **Holds layout and engine:** The **SheetLayout** and **ParserEngine** are provided by the consumer via **`useImporter({ layout, engine })`** (or initial Provider props). The hook passes them into the Provider so the Provider stores them. Layout is the single source for rules (validators, sanitizers, transforms); engine is used by the Parser to decode the file (or auto-detect when `'auto'`/omitted).
- **Holds file and state:** `file`, `rawData`, `documentHash`, `status`, `result` (sheet). So when the user navigates between UI steps (e.g. "Carga" → "Mapeo" → "Validación"), file and progress are not lost; no prop drilling — any child uses hooks to read.
- **Manages Workers:** Initializes Worker instances **once** (e.g. in `useEffect`), keeps Comlink proxies; orchestrates Parse → Convert → Sanitize → Validate → Transform. Can enforce **finite states** (e.g. do not run validation if parsing has not finished).
- **Progress via EventTarget:** Progress is **not** in Context. A single **EventTarget** dispatches **`importer-progress`** (and **`importer-aborted`** on cancel/unmount). Only the progress UI subscribes; the rest of the tree does not re-render. See *Progress and re-renders: EventTarget* below.
- **Registry API:** Three `Registry` instances (validator, sanitizer, transform); exposes `registerValidator`, `registerSanitizer`, `registerTransform` (Zero-Bundle-Size). See **2. Setting** — *Registro agnóstico*.
- **Abort & lifecycle:** Exposes **`abort()`**; on abort or **unmount**, **terminates** active Workers (`worker.terminate()`), resets status, dispatches **`importer-aborted`**. See *Maturity & resilience → Process Abort & Worker Cleanup*.

**Hooks: the interface (specialized, small)**

Hooks consume the Provider context and expose a clear, narrow API. This improves Tree Shaking and clarity.

| Hook | Responsibility |
|------|----------------|
| **`useImporter({ layout, engine })`** | Entry point. Receives **layout** (optional) and **engine** (optional: `'xlsx' \| 'csv' \| 'auto'`; when omitted, decoding is automatic). Passes them to the Provider. Exposes **`processFile(file)`** (triggers the full pipeline via the Provider) and **`registerValidator`**, **`registerSanitizer`**, **`registerTransform`**, **`abort`**. |
| **`useImporterStatus()`** | Returns **status** (e.g. `idle`, `parsing`, `validating`, `success`, `error`) and a way to read **progress** (e.g. subscribe to EventTarget or a stable progress snapshot). For progress UI. |
| **`useSheetData()`** | Returns the **result** (final sheet) and **errors** (from the sheet) for rendering the table. No knowledge of Workers. |
| **`useSheetEditor()`** | Exposes **`editCell`** for the edit pipeline (scoped sanitize + validate + transform on a single cell). |

**Example flow**

```ts
// Configuration: Provider wraps the import section
import { ImporterProvider } from 'react-import-sheet-headless';

function App() {
  return (
    <ImporterProvider>
      <MyUploader />
      <MyDataTable />
    </ImporterProvider>
  );
}

// Action: entry hook receives layout and optional engine; exposes processFile
const { processFile, registerValidator } = useImporter({
  layout: myLayoutConfig,
  engine: 'auto', // optional: 'xlsx' | 'csv' | 'auto'; omit for automatic detection
});
const handleUpload = (file: File) => processFile(file);

// Status and progress (e.g. for progress bar)
const { status } = useImporterStatus();

// Result for table
const { sheet, errors } = useSheetData();

// Edit after result is ready
const { editCell } = useSheetEditor();
```

All of this is exposed via **context** and these **hooks**; no UI is rendered by the library. **No Zustand** — only React state in the Provider and **EventTarget** for progress.

### Context stability

So that consumer optimizations (e.g. `React.memo`, virtualized lists) are not broken:

- **Context value:** The object passed to the Provider's `value` must be **memoized with `useMemo`** so its reference is stable unless dependencies change.
- **Hooks:** Hooks that return callbacks or objects (e.g. `editCell`, actions, or context selectors) must wrap them in **`useCallback`** or **`useMemo`** so that consumers receiving these values do not re-render unnecessarily when using `React.memo` or virtualizers that rely on referential equality.

This is also reflected in `.cursor/rules/typescript-standards.mdc` (Performance & State).

---

### Progress and re-renders: EventTarget

**Problem:** React Context is ideal for data that changes rarely (theme, logged-in user). For a data pipeline, progress changes very frequently (e.g. row 1, 2, 3 … 10,000). If `progress` lives in the same Context as `result` and `status`, every progress update re-renders all context consumers. For 10,000 rows, the app would effectively re-render 10,000 times.

**Solution: EventTarget (no extra libraries).** Progress is not kept in Context. Instead:

1. The Worker (or the main-thread layer that receives worker callbacks) reports progress.
2. A single **EventTarget** (e.g. an `ImporterEventTarget` instance provided by the provider or a module) **dispatches a custom event** (e.g. `importer-progress`) with a detail payload (e.g. `{ phase, globalPercent, localPercent, currentRow, totalRows }`).
3. **Only** the component that needs to show progress (e.g. a progress bar) subscribes to that event. It updates its display via a **ref** (imperative DOM update) or a **small local state** (e.g. one `useState` for progress in that component). The rest of the React tree does not re-render when progress changes.

**Contract:** Event type e.g. `'importer-progress'`; detail shape e.g. `{ phase, globalPercent, localPercent, currentRow, totalRows }`. The library exposes the EventTarget (e.g. via `useImporterStatus()` or a dedicated `useImporterEventTarget()`) and documents the event name and detail. **No Zustand or other external state library**; the browser's built-in **EventTarget** and **CustomEvent** are sufficient (see *Provider as brain, Hooks as interface*).

---

### Data efficiency: Delta strategy (Worker ↔ Main)

**Problem:** Sending a large sheet to the Worker via `postMessage`/Comlink causes **structured clone** (copy); returning the full sheet again duplicates memory and can block the main thread.

**Solution: Minimize round-trip data.** Send the file / RawSheet to the Worker **once**. The Worker runs the full pipeline (Sanitize → Validate → Transform) internally. The Worker **does not** return the entire sheet on every step; it returns **errors** (e.g. `[{ rowIndex, cellKey, error }]`) and optionally **deltas** (only changed rows/cells). The main thread keeps a local copy of the sheet and **patches** it when it receives the errors list (and optional deltas), instead of replacing the whole tree. No Transferables or SharedArrayBuffer required for this design.

---

## Maturity & resilience

These practices avoid "black box" assumptions and make the library suitable for production and large datasets.

### 1. Worker timeout & recovery (no blind trust)

**Risk:** Web Workers can run out of memory, close unexpectedly, or hang in infinite loops. Assuming the Worker always responds leads to frozen UIs and no way to recover without a full page refresh.

**Requirement:** Implement **timeout & recovery** for every Worker call:

- **Timeout:** Each Worker invocation (e.g. `parse`, `validate`, `sanitize`, `transform`) must have a configurable **timeout** (e.g. X seconds). If the Worker does not respond within that window, the main thread must **not** wait indefinitely.
- **Controlled error:** On timeout (or on worker error), the system must emit a **typed, controlled error** (e.g. `SheetError` with `code: 'WORKER_TIMEOUT'` or `'WORKER_CRASHED'`) and update provider status to `error`, so the UI can show a clear message.
- **Recovery:** Expose an API to **restart** the process (e.g. `retryImport()` or reset state and allow the user to pick the file again) **without** requiring a page refresh. Workers that crash or are terminated should be replaceable by spawning a new Worker instance.

Implementation lives in the layer that wraps Comlink (main thread): wrap each `await worker.method(...)` in a timeout (e.g. `Promise.race` with `setTimeout`), handle rejections, and document the timeout option in the provider/hook API.

### 2. Memory management for massive files

**Risk:** Passing huge JSON objects (e.g. a sheet with 200,000 rows) between Worker and main thread causes **structured clone** and GC pressure; the main thread can freeze during deserialization.

**Requirements:**

- **Strict delta strategy:** The Worker must **not** return the full sheet after each step. It returns only **errors** and **deltas** (changed rows/cells). The main thread is a **viewer** that patches its local state; the Worker (or a single "pipeline" Worker) is the owner of the full in-memory truth during processing. See *Data efficiency: Delta strategy* above.
- **Transferables (optional):** Where applicable (e.g. raw binary or large buffers), prefer **Transferables** (e.g. `ArrayBuffer`) in `postMessage` to move ownership without copy. Document when Transferables are used.
- **Virtualization:** For consumption, the library exposes a **virtualization-friendly API** (e.g. `getRows(page, pageSize)` or `getPaginatedResult`) so the UI never needs to hold the full sheet in React state; it requests windows of data. This keeps the main thread as a "viewer" of windows rather than owner of the full dataset.

### 3. Schema versioning (layout & persisted state)

**Risk:** If the **sheetLayout** or validator/transformer identifiers change (e.g. renaming `email` to `is-email`), any **persisted sessions** (e.g. in IndexedDB) will reference the old schema. Loading that state later can break or produce inconsistent results.

**Requirements:**

- **Version on layout:** `SheetLayout` must include a **`version`** field (e.g. string or number). The library does not interpret it semantically; it is for the consumer and for migration logic to know which schema format the layout uses.
- **Version on persisted state:** Any state saved to IndexedDB (or similar) must store the **layout version** (and optionally a **state schema version**) alongside the serialized data. On load, the consumer (or the library) can check compatibility.
- **Migration:** A mature system supports **migrating** old persisted data to a new schema: either by providing a small migration API (e.g. `migrateSession(oldState, fromVersion, toVersion)`) or by documenting that the consumer must handle version mismatch (e.g. clear or re-import when version changes). The construction step that implements persistence (e.g. **11. Telemetry**) must define how version is stored and how migrations are applied (or delegated to the consumer).

### 4. I18n of errors (codes + params, UI translates)

**Risk:** If validators (or sanitizers) return **static error strings** (e.g. `"Email inválido"`), the library is tied to one language and cannot be used in a global product.

**Requirement:** Validators and sanitizers must **not** return human-readable strings as the primary contract. They must return **error codes and metadata**:

- **Shape:** Each error is a **typed object**, e.g. `{ code: string, params?: Record<string, unknown>, level?: 'error' | 'warning' | 'fatal', message?: string }`. Example: `{ code: 'INVALID_EMAIL', params: { value: 'x' } }`. The optional `message` is a **fallback** for debugging or default UI; the **authoritative** display comes from the consumer. For **async table** validators/transforms that call the backend, the library uses stable codes such as **`EXTERNAL_VALIDATION_FAILED`** and **`EXTERNAL_TRANSFORM_FAILED`** (with optional `params: { reason: 'network' | 'timeout' | 'server_error' }`) so the UI can show a clear message when the backend fails or the request is aborted.
- **Translation:** The **UI** (consumer) is responsible for translating `code` (and optionally `params`) into a localized string. The library remains language-agnostic and usable globally.
- **Exported type:** Export a **`SheetError`** (or equivalent) type so consumers can rely on `code` and `params` with TypeScript. Document the standard error codes (e.g. in `docs/validators.md` or `docs/errors.md`).

This is reflected in **6. Validator** (error structure) and in **2. Setting** (shared `Error` / `SheetError` type in `src/types/`).

### 5. Process Abort & Worker Cleanup

**Risk:** If the user cancels an import or navigates away (e.g. closes a modal or leaves the page) during a heavy process (e.g. validating 50k rows), the Worker continues to consume CPU and memory in the background. This is a **resource leak**: the browser keeps the Worker thread alive, and on mobile it drains battery and can cause the tab to be killed. Without explicit cleanup, starting a new import can leave the previous Worker still running.

**Requirements:**

- **Abort API:** The Provider (or the hook that owns the pipeline) must expose an **`abort()`** (or **`cancel()`**) function. When called, it must **terminate** the active Worker instance(s) via **`worker.terminate()`**. This is "brute force" but effective: it frees memory and CPU immediately. Optionally, the Worker can also respect an **AbortSignal** for "polite" cancellation (e.g. stop after the current chunk); the primary contract is still **terminate()** on user cancel or unmount.
- **Lifecycle cleanup:** In the Provider (or in each worker hook such as `useParserWorker`, `useValidatorWorker`), use a **`useEffect` cleanup** so that when the component **unmounts**, any active Worker is terminated. Example: `useEffect(() => { return () => { if (workerRef.current) workerRef.current.terminate(); }; }, []);`. This ensures that if the user uses the importer inside a modal or a page and then navigates away, the Worker is not left running.
- **State reset on abort:** After calling `worker.terminate()`, the provider must: (1) set **status** to `'idle'` (or a dedicated `'cancelled'` if desired); (2) clear or leave unchanged any partial result/rawData according to product rules; (3) dispatch a final event on the **EventTarget** (e.g. **`importer-aborted`**) so that any progress UI stops updating and can hide or reset. The progress bar component can listen for `importer-aborted` to reset its display.
- **Replaceability:** After abort, the next import must be able to run normally; the layer that creates Workers must spawn a **new** Worker instance when the user starts again (no reuse of a terminated Worker).

**Why this matters:** (1) **UX** — If the user cancels a wrong file and uploads a new one, without `terminate()` the old Worker may still be running and the app can feel slow or inconsistent. (2) **Mobile** — Not terminating a heavy process drains battery and can trigger the browser to kill the tab. (3) **Resource hygiene** — Explicit lifecycle management is a hallmark of mature libraries.

Implementation: the Provider (or a small "worker manager" used by the Provider) keeps a reference to the current Worker(s). `abort()` and the useEffect cleanup both call `terminate()` on that reference and then clear it. See **2. Setting** (Provider lifecycle, abort in API) and the Worker steps (3. Parser, 5. Sanitizer, 6. Validator, 7. Transform) for where to store the ref and run cleanup.

---

## Public API vs internal (infrastructure)

As the library grows, the key to a professional NPM-style library is to **separate what is internal/infrastructure from what is public/consumption**. Consumers should only touch the Provider (to wrap the app), the public hooks, and the exported types—never the Context implementation or internal hooks.

**Principle (aligned with libraries like TanStack Query or Apollo Client):**

- **Internal / infrastructure:** Context definition, Provider implementation, Worker/Comlink wiring, state setters, and any hook used only by the Provider (e.g. a hook that talks to Comlink). These live under **`src/providers/`** (and optionally internal hooks in **`src/hooks/`** that are not re-exported from **`src/index.ts`**).
- **Public / consumption:** The component **`ImporterProvider`**, the hooks **`useImporter`**, **`useImporterStatus`**, **`useSheetData`**, **`useSheetEditor`**, and the types needed to use them (e.g. **`SheetLayout`**, **`SheetError`**, **`ProcessedSheet`**). These are the only symbols the user should import; they are re-exported from **`src/index.ts`** (the barrel).

**Where things live:**

| Concern | Location | Exported from `index.ts`? |
|--------|----------|---------------------------|
| **ImporterProvider** (component) | `src/providers/ImporterProvider.tsx` | Yes |
| **ImporterContext** (definition, internal) | `src/providers/ImporterContext.ts` | No |
| Public hooks (useImporter, useSheetData, …) | `src/hooks/` | Yes |
| Internal hooks (e.g. worker/Comlink wiring) | `src/hooks/` or `src/providers/` | No |
| Shared types (SheetLayout, SheetError, …) | `src/types/` | Yes (only types the user needs) |
| Core (Workers, Registries, pipeline) | `src/core/` | No |

**Barrel (`src/index.ts`):** This file is the single control point for the public API. It exports only: the Provider, the public hooks, and the public types. It must **not** export the Context instance, internal hooks, or internal modules. That way the project can be organized freely under `src/` while the consumer sees a clean, minimal surface.

**User-facing usage (how-to docs):** How-to is **split by context**. **`docs/how-to.md`** describes **general usage** (setup, flow, Provider, hooks, pipeline). **Context-specific** topics use **one file each**: `docs/how-to-<context>.md` (e.g. `how-to-validators.md`, `how-to-layout.md`, `how-to-transformers.md`). When adding or changing a user-facing feature: update the general how-to if it affects the overall flow; create or update the **context-specific** how-to file for that feature (setup, options, examples). Internal or implementation-only changes do not require how-to updates. This keeps the library discoverable without reading source; see the anchors table and `.cursor/rules/typescript-standards.mdc` §6.

**How-to documentation structure:**

- **`docs/how-to.md`** — General usage only: setup, Provider, hooks, end-to-end flow, entry points. No deep dives per topic.
- **`docs/how-to-<context>.md`** — One file per specific context (e.g. validators, transformers, layout, register APIs, progress, edit). Each file covers setup, options, and examples for that topic. Create a new file when a new user-facing context deserves its own guide.

---

## Product architecture (publishing & consumption)

These practices ensure the library works correctly when published and consumed in real projects (NPM, TypeScript, bundlers).

### 1. NPM publish: `files` and `.npmignore` vs `.gitignore`

- **`.gitignore`** keeps `dist/` out of Git (built artifacts are not versioned).
- **NPM needs `dist/`** in the published package so consumers get the built code.
- **`package.json`** must include **`"files": ["dist"]`** so NPM always includes `dist/` regardless of ignore rules.
- **`.npmignore`** (optional) controls what is excluded from the published tarball:
  - Exclude tests (e.g. `*.test.ts`, `*.spec.ts`, `**/__tests__/`), Husky/config that only matters in development, and optionally `src/` if you want a smaller package.
  - Leaving `src/` in the package is common to help debugging and source maps; the decision is a trade-off between size and debuggability.

### 2. Error handling for the consumer (and I18n)

As a headless validation library, consumers never see our source—only what we return or throw.

- **Do not throw plain strings.** Use a **custom error class** (e.g. `SheetError`) or a **standard error object shape** so consumers can detect and handle errors reliably.
- **Typed errors:** Export a **`SheetError`** (or equivalent) type so consumers can import it and TypeScript knows the shape: **`code`** (string), **`params`** (optional record), **`level`**, and optional **`message`** as fallback. See *Maturity & resilience → I18n of errors*: the UI translates `code` + `params` into localized text; the library stays language-agnostic.
- Errors that are part of the **sheet** (e.g. `sheet.errors`, `row.errors`, `cell.errors`) use this same shape so the consumer's UI can display them with full type safety and any locale.

### 3. Tree shaking: Named Exports Only

To ensure tree-shaking works perfectly, the public API uses only named exports:

- **Public API in `src/index.ts`** must use **named exports only** (`export { ... }`, `export type { ... }`). No default export.
- Bundlers (Webpack, Vite, etc.) can then eliminate dead code when the consumer imports only what they use (e.g. `import { useImporter } from '...'` without pulling in unused modules).

### 4. Backward compatibility (public API and data structures)

When adding or changing features, the library must not break existing consumers.

- **Avoid breaking changes:** Do not remove or rename public types, hook signatures, provider props, or layout shapes in a way that forces immediate, irreparable breakage. Prefer **extending** (new optional fields, overloads) over replacing.
- **Reuse when possible:** Reuse existing structures (e.g. same `SheetLayout` shape, same error shape) and evolve them in a backward-compatible way. New behaviour can be gated by new optional options or a version field.
- **Compatibility layer when reuse is not possible:** If a new design cannot reuse the old structure, implement a **normalization step** that detects the old format (e.g. by checking for legacy fields, missing new fields, or a layout version) and converts it internally to the new format. Code that still passes the old shape continues to work without changes.
- **Deprecation before removal:** Before removing a deprecated API or structure, document it as deprecated in the relevant docs (`docs/how-to.md` or the context-specific `docs/how-to-<context>.md`) and in types/comments if needed, and optionally log a one-time dev warning. Plan and document a migration path and a minimum support period so consumers can migrate.

This is also reflected in `.cursor/rules/typescript-standards.mdc` (§11 Backward Compatibility).

---

## Folder structure

### Root layout

```
src/
  types/                    # Shared / non–process-specific types (Sheet, Row, Cell, SheetLayout, Error, ImporterState, etc.)
    error.ts                # SheetError, SheetErrorLevel
    raw-sheet.ts            # BaseSheet, RawSheet, RawSheetCell, RawSheetRow
    sheet.ts                # Sheet, ValidatedRow, ValidatedCell
    sheet-layout.ts         # SheetLayout, SheetLayoutField, SheetLayoutRef, ValidatorOrWithParams
    importer-state.ts       # ImporterState, ImporterStatus, ImporterProgressDetail, event names
    index.ts                # Barrel: re-export all shared types
  providers/                # Infrastructure: Provider (public) + Context and brain logic (internal). Not for direct user consumption.
    ImporterProvider.tsx    # Public: the component that wraps the app (exported from index.ts)
    ImporterContext.ts      # Internal: createContext and context value type (not exported)
    state.ts                # initialState
    types.ts                # ImporterContextValue, ImporterProviderProps, UseImporterStateSettersDeps, UseImporterActionsDeps
    useImporterStateSetters.ts  # state setters (setFile, setRawData, setLayout, …)
    useImporterActions.ts   # actions (processFile, register*, abort, dispatchProgress, setActiveWorker)
    useImporterContext.ts   # Internal: hook used by public hooks to read context (not exported)
    index.ts                # Barrel: re-export only ImporterProvider (and what it needs internally)
    ImporterProvider.test.tsx
  shared/                   # Shared code used across core and context (not process-specific)
    registry/               # Registry Core (universal): Registry<T> for validators, sanitizers, transforms
      Registry.ts
      types.ts              # RegistryLevel, RegistryEntry
      index.ts
  core/                     # Process-specific modules; each has its own context
    parser/
      types/                # ParseOptions, ParserMeta
        parse-options.ts
        parser-meta.ts
        index.ts
      engines/              # xlsx (SheetJS), csv (Papa Parse), normalize-cell
        xlsx-parser.ts
        csv-parser.ts
        normalize-cell.ts
      worker/               # parser.worker.ts (Comlink load + parseAll), worker-url.ts
      hooks/
        useParserWorker.ts  # internal: creates worker, exposes load/parseAll
      adapter.ts            # parseSheet(blob, options): routes by extension/MIME
      hash.ts               # streamHashHex(blob) for documentHash
      index.ts
    convert/
      types/                # ConvertedSheet, ColumnMismatch, ConvertSuccess, ConvertResult
        index.ts
      hooks/
        useConvert.ts       # or Convert logic inside useImportSheet
      ...                   # run-convert, match-headers
      index.ts
    sanitizer/
      types/                # Sanitizer worker messages, progress payloads
        index.ts
      hooks/
        useSanitizerWorker.ts
      ...                   # build-initial-sheet or consume ConvertedSheet, runner/, worker/
      index.ts
    validator/
      types/                # Validator worker messages, progress payloads
        index.ts
      hooks/
        useValidatorWorker.ts
      ...                   # build-initial-sheet, runner/, worker/
      index.ts
    transform/
      types/                # Transform worker messages, progress payloads
        index.ts
      hooks/
        useTransformWorker.ts
      ...                   # runner/, worker/
      index.ts
    editor/
      types/                # EditCellParams, EditResult (if not in src/types)
        index.ts
      hooks/
        useSheetEdit.ts
      ...                   # resolve, immutable-update, run-edit-pipeline
      index.ts
  hooks/                    # Public hooks (cross-process or app-level)
    types.ts                # UseImporterOptions and other hook option/contract types
    useImporter.ts          # useImporter({ layout }): processFile, register*, abort
    useImportSheet.ts       # useImportSheet(): startFullImport; triggers parser load on processFile
    useImporterStatus.ts    # status, progressEventTarget
    useSheetData.ts         # sheet, errors
    useSheetEditor.ts       # editCell (stub until Step 8)
    useImporterEventTarget.ts # progressEventTarget, subscribeToProgress
    index.ts
  utils/
    controller/             # Building Blocks: standalone functions grouped by field/context (not by type)
      email/                # Example context: all email-related sanitizers, validators, transforms
        cell-email-sanitizer.ts   # export const emailSanitizer = ...
        cell-email-validator.ts   # export const emailValidator = ...
        cell-email-transform.ts   # export const emailTransform = ...
        row-email-sanitizer.ts
        row-email-validator.ts
        row-email-transform.ts
        table-email-sanitizer.ts
        table-email-validator.ts
        table-email-transform.ts
      # [other-context]/    # e.g. phone/, date/, required/, etc. — same pattern
    presets/                # Preset Helpers: combo functions for convenience (e.g. registerStandardValidators)
      standard-validators.ts
      standard-sanitizers.ts
      standard-transforms.ts
    index.ts                # Barrel: re-export all Building Blocks and Presets for easy import
  index.ts                  # Public API: provider, hooks, types
```

### Types — placement and one-file-per-type rule

**Where to put types**

- **Shared / generic types** (used by more than one core module or by the provider):
  - Live in **`src/types/`**.
  - Examples: `Error` / `SheetError`, `Sheet`, `Row`, `Cell`, `SheetLayout`, `Registry`, and any shared contracts (e.g. `ImporterState`, `ImporterStatus`).
  - Re-exported from **`src/types/index.ts`** (and from main **`src/index.ts`** as needed).
- **Context- or module-specific types** (used only by one context or core module):
  - Live in a **`types/`** folder **inside that module**.
  - Examples:
    - **Providers:** `src/providers/types.ts` (or `providers/types/`) — e.g. `ImporterContextValue`, `ImporterProviderProps`, each in its own file.
    - **Parser:** `core/parser/types/` — e.g. `RawSheet`, `RawSheetRow`, `RawSheetCell`, parser worker message types.
    - **Convert:** `core/convert/types/` — `ConvertedSheet`, `ColumnMismatch`, `ConvertSuccess`, `ConvertResult`.
    - **Sanitizer:** `core/sanitizer/types/` — sanitizer worker messages, progress payloads.
    - **Validator:** `core/validator/types/` — validator worker messages, progress payloads.
    - **Transform:** `core/transform/types/` — transform worker messages, progress payloads.
    - **Editor:** `core/editor/types/` — `EditCellParams`, `EditResult` (if not shared).
  - Re-exported from **`<module>/types/index.ts`** (and from **`<module>/index.ts`** if part of the public surface).

**One type per file**

- Every type (or small, tightly related group) must live in **its own file**. Do not put multiple unrelated types in a single file.
- In **`src/types/`**: one file per type or per small cohesive group (e.g. `error.ts`, `sheet.ts`, `sheet-layout.ts`).
- In **`<module>/types/`**: same rule — e.g. `src/providers/types/context-value.ts`, `src/providers/types/provider-props.ts`; `core/parser/types/raw-sheet.ts`, `core/parser/types/worker-messages.ts`.
- The barrel **`types/index.ts`** re-exports from these individual files so the rest of the codebase imports from the barrel.

### Core modules (contexts separated)

Each process has its own **context** and logic under **`core/`**:

| Module       | Path                  | Responsibility |
|-------------|------------------------|----------------|
| **Parser**  | `core/parser/`         | Read file (CSV/XLSX/ODS), run in Worker, output `RawSheet`. Updates provider `rawData` and `status`; dispatches progress via **EventTarget**. |
| **Convert** | `core/convert/`        | Take `RawSheet` + `sheetLayout` (from hook), align headers to layout; output **ConvertedSheet** or **ConvertResult** (headers found, mismatches, reorderColumns, renameColumn, applyMapping). Runs on main thread. Updates provider with converted data or mapping state. |
| **Sanitizer** | `core/sanitizer/`    | Runs **before Validator**. Take **ConvertedSheet** (from Convert) + `sheetLayout`, run cell → row → sheet sanitizers in Worker; output normalized/cleaned data. Updates provider; dispatches progress via **EventTarget**. Uses `utils/controller/[context]`. |
| **Validator** | `core/validator/`   | Take sanitizer output (or RawSheet) + `sheetLayout`, run cell → row → sheet validators in Worker, output **sheet** with errors (or errors/deltas for main to patch). Updates provider; dispatches progress via **EventTarget**. Uses `utils/controller/[context]`. |
| **Transform** | `core/transform/`   | Take validated **sheet** + `sheetLayout`, run cell → row → sheet transforms in Worker (only where no errors). Output **sheet** with transformed values (or deltas). Updates provider; dispatches progress via **EventTarget**. Uses `utils/controller/[context]`. |
| **Editor**  | `core/editor/`         | Expose result **sheet** and **editCell**. Run scoped sanitizer + validation + transform on edit; update provider with new sheet. No Worker required for single-cell edit. |

Contexts are **separated per process** (e.g. parser context, validator context, transform context, editor context or a unified importer context that composes them). The **ImporterProvider** (from Setting) is the **brain**: it holds **layout**, **file**, **status**, **result (sheet)**, **errors** (inside the sheet), and the **Worker** lifecycle; it exposes **processFile** (via `useImporter`) and **editCell** (via `useSheetEditor`). **Progress** is not in Context; it is emitted via **EventTarget** so only the progress UI re-renders (see *Provider as brain, Hooks as interface* and *Progress and re-renders: EventTarget*).

### Utils (controller by context/field) — Building Blocks & Registry Pattern

Under **`src/utils/controller/`**:

Reusable sanitizers, validators, and transforms are **grouped by field/context** (e.g. `email`, `phone`, `date`), not by type. Each context folder contains all logic for that field at every level. **These are exported as standalone functions** (Building Blocks) so the consumer can import only what they use (Tree Shaking perfecto).

- **Naming:** `{level}-{context}-{type}.ts` — e.g. `cell-email-sanitizer.ts`, `row-email-validator.ts`, `table-email-transform.ts`.
- **Levels:** `cell-*`, `row-*`, `table-*` (table = sheet level). Execution order in the pipeline remains **cell → row → sheet**.
- **Example:** `utils/controller/email/` holds `cell-email-sanitizer`, `cell-email-validator`, `cell-email-transform`, and the same for row and table, so everything related to the "email" field lives in one place.
- **Zero-Bundle-Size:** The library **does not register anything by default**. The consumer imports the functions they need (e.g. `import { emailValidator } from '@lib/utils'`) and registers them manually in the Provider (e.g. `registerValidator('email', emailValidator)`). If the consumer does not import/register the email validator, that code never reaches the final bundle.

**Registry Pattern:** Layouts reference functions by **name (string identifier)** only (e.g. `validators: ['required', 'email']`). The Provider maintains three `Registry` instances (validator, sanitizer, transform) that map names to functions. Workers import the same controller modules (ESM imports) and resolve by name from their own Registry. See **2. Setting** — *Registro agnóstico de validadores/sanitizers/transformadores*.

**Registry entry type (cell | row | table):** So the **Runner** in the Worker knows when to invoke each function without hard-coding logic per import, every registry entry must carry a **level/type**: **`'cell' | 'row' | 'table'`**. The Runner then:
- **cell:** Invokes the function **per cell** (inside the row loop).
- **row:** Invokes the function **per row** (once per row, after cell validators for that row).
- **table:** Invokes the function **once at the end** of the cycle, with access to the full dataset — **not** per row.

When registering (e.g. `registerValidator(name, fn, { type: 'cell' })` or via `Register()` which sets the type from the controller definition), the Registry stores **`{ fn, type }`**. The orquestador uses this to decide: call cell/row in the chunk loop; call table only after all rows are processed. Same pattern for sanitizers and transforms. See **6. Validator** (table-level scope, output, atomicity) and **2. Setting** (Registry API with type).

**Register() pattern (built-in and custom):** To simplify building layouts and avoid magic strings, every controller (validator, sanitizer, transform — cell, row, or sheet level) **exposes a `Register()` function** that:

1. **Returns the string identifier** for that controller (e.g. `'email'`, `'required'`, `'toUpperCase'`). This is the same string used in the layout and in the Worker Registry.
2. **Optionally registers the implementation** in the Provider/Worker when a register callback is passed. If the user calls `CellEmailValidator.Register(registerValidator)`, the library registers the email validator with the Provider (and syncs to the Worker if not already registered) and returns `'email'`. So the layout can mix built-in and custom IDs: `validators: [CellEmailValidator.Register(registerValidator), 'phone', MyCustomValidator.Register(registerValidator)]`.
3. **Idempotent registration:** If the controller is already registered (e.g. by a preset or earlier call), `Register(registerFn)` does not register again; it just returns the identifier.

**Built-in controllers** (in `src/utils/controller/[context]/`) export both the raw function and a **Register** helper, e.g.:

- `CellEmailValidator.validate` — the function to run.
- `CellEmailValidator.id` — constant string `'email'`.
- `CellEmailValidator.Register(registerValidator?: (name: string, fn: T) => void): string` — returns `'email'`; if `registerValidator` is provided, registers `CellEmailValidator.validate` under `'email'` (if not already registered) then returns `'email'`.

**User-created controllers:** The library exposes **interfaces** (and optionally factory helpers) so the user can define their own validators/sanitizers/transforms and a `Register()` that follows the same contract. Example interface (see **2. Setting** and **6. Validator** for full types):

```ts
// Conceptual: user implements this and can call MyValidator.Register(registerValidator) in the layout
interface CellValidatorDefinition {
  readonly id: string;
  validate: CellValidatorFn;  // (value, row) => SheetError[] | null
  Register(registerFn?: (name: string, fn: CellValidatorFn) => void): string;
}
```

The user creates e.g. `MyCustomValidator` with `id: 'my-rule'`, `validate: (value, row) => ...`, and `Register(registerFn) { if (registerFn) registerFn(this.id, this.validate); return this.id; }`. Then they can use `validators: [CellEmailValidator.Register(registerValidator), MyCustomValidator.Register(registerValidator)]` in the layout. The layout stays declarative and the same pattern works for built-in and custom controllers.

**Layout construction:** The layout can be built with a mix of:

- **Built-in Register():** `CellEmailValidator.Register(registerValidator)` — returns `'email'`, ensures the Worker has the implementation if `registerValidator` was passed.
- **Custom string IDs:** `'phone'` — the user must have registered `'phone'` elsewhere (e.g. `registerValidator('phone', phoneValidator)` or `CellPhoneValidator.Register(registerValidator)`).
- **User Register():** `MyCustomValidator.Register(registerValidator)` — same contract as built-in.

So the layout is easy to write: no magic strings for built-ins, and custom controllers integrate the same way. Registration in the Worker happens on first use when `Register(registerFn)` is called with the Provider’s register function (e.g. from `useImporter()`).

**Technical note: Serialization to Worker and pure functions.** When the implementation uses **serialization** (e.g. `fn.toString()` sent to the Worker and reconstructed with `new Function`) to pass validators/sanitizers/transforms to the Worker, those functions **must be pure**: they must not depend on variables from an outer scope (closures). With `fn.toString()`, only the function body is sent; any closed-over variable (e.g. a list, a config object) does not exist in the Worker, so the reconstructed function would break. **Solution: pass all configuration via `params` in the layout.** The layout already supports `{ name: 'in-list', params: { list: ['active', 'paused'] } }`. The validator is a **pure function** that receives everything via arguments:

```ts
// Pure: no external variables. All data comes from (value, row, params).
const isInListValidator = (value: unknown, row: RawSheetRow, params?: { list: unknown[] }) => {
  if (!params?.list) return null;
  return params.list.includes(value) ? null : [{ code: 'NOT_IN_LIST', params: { value, list: params.list } }];
};
```

In the layout, the user writes: `validators: [{ name: 'in-list', params: { list: ['active', 'paused'] } }]`. The Worker receives the layout (including `params`) via structured clone; it looks up the function by name (from the Registry, either shared ESM or reconstructed from string) and calls it with `(value, row, params)`. So "external" data (lists, min/max, allowed values, etc.) is never in a closure — it is always in **params**, which is serializable and identical in the Worker. **Rule:** Validators/sanitizers/transforms that need configuration (lists, thresholds, options) must accept a **params** argument and the layout must pass that configuration in the `{ name, params }` form. This keeps functions serialization-safe and Worker-compatible whether the project uses ESM code sharing or `fn.toString()`.

**Sync vs async: cell/row sync, only table async.** For **predictable performance** and **efficient batching**:

- **Cell and row** validators, sanitizers, and transforms **MUST be synchronous**. The Runner invokes them in a tight loop over thousands of rows; async here would depend on network/event loop and would not scale (e.g. 10,000 individual backend calls).
- **Only table-level** validators and transforms **may be async** (e.g. one batch request to the backend with the full dataset for integrity checks). This keeps network usage to a **single (or few) batched request(s)** instead of one per row. The user registers async table functions under the same **Register()** scheme; the Runner runs them **once at the end** with `await`.

So: **Validator** = Sync Row Loop (cell + row) → Async Table Check (if any). **Transform** = Sync Row Loop (cell + row) → Async Table Check (if any). Document this in **6. Validator** and **7. Transform** so implementers do not make cell/row validators or transforms async.

**Table-level validations (and sanitizers/transforms): scope, output, atomicity.** Functions registered with **`type: 'table'`** behave differently from cell/row:

- **Scope:** Table-level validations (and sanitizers/transforms) run **once** in the Worker **after** all rows have been processed. They receive the **full dataset** (the entire sheet or processed structure) so they can enforce integrity across rows (e.g. unique keys, cross-row consistency, totals).
- **Output:** They can produce **errors that affect multiple rows** or **global sheet errors** (e.g. `sheet.errors` or errors attached to several rows). The delta/result must support both per-cell/per-row errors and table-level or multi-row errors. When they are **async** (e.g. backend call), they must return the **same schema**: either **SheetError[]** (or equivalent) for validation, or the **updated result** for transforms, so the main thread can patch the sheet or show errors consistently.
- **Atomicity:** The **Transform** step should only run if **table-level validations** (especially integrity) have passed, or if the **user explicitly accepts** to continue with errors. So: (1) run cell → row → **table** validators; (2) if table validators report errors, either **block** Transform until the user fixes data or **allow the user to opt in** ("Continue with errors"); (3) only then run Transform (which already skips rows/cells with errors). This avoids transforming data that fails integrity checks at sheet level. See **6. Validator** and **7. Transform** for the exact contract.

**Resilience for async table (validators/transforms):** When table-level functions call the backend (fetch/API):

- **Try/catch:** The Runner (e.g. in `run-table-validation.ts` or equivalent) must wrap the async call in **try/catch**. On failure (network error, 500, timeout), it must **not** leave the Worker hanging; it must return a **SheetError** with a stable code (e.g. **`EXTERNAL_VALIDATION_FAILED`** or **`EXTERNAL_TRANSFORM_FAILED`**) and optional params (e.g. `{ reason: 'network' | 'timeout' | 'server_error' }`), so the UI can show a clear message (and I18n can translate it).
- **Abortability:** The same **AbortController** used for process cancellation (see *Process Abort & Worker Cleanup*) must be passed into the table-level runner so that any **fetch** to the backend can be cancelled when the user calls **`abort()`**. Otherwise a pending backend request could outlive the cancelled import.

Sanitizers run **before** validators in the pipeline. Optional **`utils/presets/`** can expose helper functions (e.g. `registerStandardValidators`) that register multiple functions at once for convenience; Tree Shaking still works because presets live in `utils` and are only imported if used.

### Hooks

- **Public API (consumer-facing):** All live in **`src/hooks/`** and are the **only** hooks re-exported from **`src/index.ts`** (see *Public API vs internal*). The library exposes **five specialized hooks** that consume the Provider context (see *Provider as brain, Hooks as interface*):
  - **`useImporter({ layout })`** — entry point; receives layout, exposes **`processFile(file)`**, `registerValidator`, `registerSanitizer`, `registerTransform`, `abort`.
  - **`useConvert()`** — after raw data is set: **`convert()`** to align file headers to layout; returns **`convertedSheet`** or **`convertResult`** (headersFound, mismatches, reorderColumns, renameColumn, applyMapping).
  - **`useImporterStatus()`** — returns status and progress (EventTarget subscription or snapshot); for progress UI.
  - **`useSheetData()`** — returns result (sheet) and errors; for table rendering.
  - **`useSheetEditor()`** — returns **`editCell`**; for the edit pipeline.
- **Internal hooks** (used only by the Provider or by other hooks, **not** exported from **`src/index.ts`**):
  - **`src/hooks/`** — e.g. `useImporterEventTarget`, or any hook that wraps Comlink/Worker for the Provider (e.g. `useInternalWorker`). Keep these in `src/hooks/` for discoverability but do **not** list them in the barrel.
  - **`src/providers/`** — e.g. `useImporterContext`, `useImporterStateSetters`, `useImporterActions`; only the Provider and public hooks import them.
- **Process-specific hooks** (internal or composed by the above) live next to their process:
  - **`core/parser/hooks/`** — e.g. `useParserWorker`, `usePreview`; parser invoked via Provider when `processFile(file)` runs.
  - **`core/convert/hooks/`** — e.g. `useConvert` (or Convert logic inside the Provider/orchestrator).
  - **`core/sanitizer/hooks/`** — e.g. `useSanitizerWorker`.
  - **`core/validator/hooks/`** — e.g. `useValidatorWorker`.
  - **`core/transform/hooks/`** — e.g. `useTransformWorker`.
  - **`core/editor/hooks/`** — e.g. `useSheetEdit`; used by `useSheetEditor()`.
- Only the **four public hooks** above are re-exported from **`src/index.ts`**.

### Barrels (index and types)

- **`src/types/index.ts`** — re-exports all shared types from `src/types/`.
- **`src/index.ts`** — **single control point for the public API.** It exports **only** what the user needs:
  - **Provider:** `ImporterProvider` from `src/providers/ImporterProvider` (or `src/providers`).
  - **Public hooks:** `useImporter`, `useImporterStatus`, `useSheetData`, `useSheetEditor` from `src/hooks/`.
  - **Public types:** e.g. `SheetLayout`, `SheetError`, `ProcessedSheet` (or equivalent) from `src/types/`.
  - It must **not** export: the Context instance, `useImporterContext`, internal worker hooks, or internal provider modules. This keeps the library surface clean and NPM-friendly (see *Public API vs internal*).
- Each **`core/<process>/`** has:
  - **`core/<process>/types/index.ts`** — re-exports process-specific types.
  - **`core/<process>/index.ts`** — re-exports public API of that process (hooks, types, worker factory if needed); these are for internal use, not for `src/index.ts`.

---

## Dependencies (worker layer)

- **Comlink** is used for all Web Worker communication. Add `comlink` as a dependency; worker entry points use `Comlink.expose(api)` and the main thread uses `Comlink.wrap(worker)` to obtain a typed proxy. Progress callbacks from worker to main use `Comlink.proxy(callback)`.

---

## Tests

- **Tests sit next to the code they cover:** e.g. `*.test.ts` / `*.spec.ts` beside the corresponding `.ts` or `.tsx` file (e.g. `run-validation.ts` and `run-validation.test.ts` in the same folder).
- No separate "tests only" tree; colocation keeps tests easy to find and refactor.
- **Coverage target:** **90%** (see `.cursor/rules/typescript-standards.mdc` §3). New features and changes must not lower the threshold.
- **Coverage exclusions:** **(1)** **Workers** (`*.worker.ts`) may be excluded from coverage. **(2)** **Async hooks** that depend only on external agents or external events and have **no explicit logic** to test (e.g. thin wrappers around Comlink/Worker or event subscriptions) may be excluded. **(3)** Whenever a hook or worker **contains testable logic** (state derivation, error mapping, branching), that logic **must** be tested—by **isolating** it into a pure function or testable unit and covering it with unit tests.
- Run with **Vitest**; success criteria for each Construction Step are described in the corresponding doc (1. PackageSetting, 2. Setting, 3. Parser, 4. Convert, 5. Sanitizer, 6. Validator, 7. Transform, 8. Edit, 9. View, 10. Readme, 11. Telemetry).

---

## Flow summary

1. **Setting (0):** **ImporterProvider** is the single source of truth (layout, file, state, Workers lifecycle). It uses **EventTarget** for progress (no Zustand). Public API: **`useImporter({ layout })`** (entry point; exposes **`processFile(file)`**, register APIs, `abort`), **`useImporterStatus()`** (status + progress), **`useSheetData()`** (result + errors), **`useSheetEditor()`** (`editCell`). Shared types in `src/types/`; Provider maintains three `Registry` instances and exposes register APIs for Zero-Bundle-Size.
2. **Parser (1):** Reads file in Worker, produces `RawSheet`; updates provider; dispatches progress via **EventTarget**. Types like `RawSheet` in `core/parser/types/`.
3. **Convert (2):** Consumes `RawSheet` + `sheetLayout`; aligns headers to layout; produces **ConvertedSheet** or **ConvertResult** (headers found, mismatches, reorderColumns, renameColumn, applyMapping). Runs on main thread. See **4. Convert.md**.
4. **Sanitizer (3):** Runs **before Validator**. Consumes **ConvertedSheet** + `sheetLayout`; runs **cell → row → sheet** sanitizers in Worker; produces normalized output. Updates provider; dispatches progress via **EventTarget**. Implementations in `utils/controller/[context]`.
5. **Validator (4):** Consumes sanitizer output + `sheetLayout`; runs validators in Worker: **sync** cell/row loop, then **async** table check (if any); produces **sheet** with errors (or errors/deltas); updates provider; dispatches progress via **EventTarget**. Table validators may be async (backend); Runner uses try/catch and AbortController for resilience. Implementations in `utils/controller/[context]`.
6. **Transform (5):** Consumes validated **sheet** + `sheetLayout`; runs transforms in Worker (only where no errors): **sync** cell/row loop, then **async** table check (if any); produces final **sheet** (or deltas); updates provider; dispatches progress via **EventTarget**. Table transforms may be async; same resilience (try/catch, AbortController). Implementations in `utils/controller/[context]`.
7. **Edit (6):** Provider exposes **result (sheet)** and **errors** (from sheet) and **editCell**. On edit, run scoped sanitizer + validation + transform and update provider sheet. Editor uses the same controller runners in scope (cell → row → sheet), resolved from `utils/controller/[context]`.

All of this is **headless**: the library provides state, result, errors, edit functions, and an **EventTarget** for progress so only the progress UI re-renders; the consumer builds the UI in English or any language.

**Construction Steps (docs):** Numbered 1–11: **1. PackageSetting**, **2. Setting**, **3. Parser**, **4. Convert**, **5. Sanitizer**, **6. Validator**, **7. Transform**, **8. Edit**, **9. View**, **10. Readme**, **11. Telemetry**. The pipeline in the Flow summary (Setting → Parser → … → Edit) corresponds to steps 2–8 in that list.
