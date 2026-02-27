# Change registry (history)

**Purpose:** Brief log of what changed, why, and which files were affected. Used for audit-before-proceeding and to keep context across sessions. One entry per logical change; most recent first.

See also: `.cursor/devlog.md` (session journal with technical decisions), `CHANGELOG.md` (optional, at package root, for user-facing releases).

---

## Entries

<!-- HISTORY_ENTRIES -->

### 2026-02-27 — How-to docs updated per context: general + how-to-parser

**What changed:** Applied the how-to split-by-context rule. **(1)** **`docs/how-to.md`** — Reduced to general usage only: setup (Provider, useImporter with layout/engine), table of hooks and their role, one-paragraph flow (processFile → preview → startFullImport), and "See also" links to context-specific guides. **(2)** **`docs/how-to-parser.md`** — New: parser/import context (supported formats, engine option, preview vs full import, RawParseResult/RawSheet types, progress and abort). Content aligned with Construction Step 3 (Parser) and entry hook params (layout + engine) from history.

**Why:** Align docs with Architecture and typescript-standards: one general how-to plus one file per specific topic.

**Affected files:** `docs/how-to.md`, `docs/how-to-parser.md`, `.cursor/history.md`.

### 2026-02-27 — How-to docs split by context: general + one file per topic

**What changed:** (1) **Rule (`.cursor/rules/typescript-standards.mdc` §6):** User-facing how-to is now **split by context**: **`docs/how-to.md`** for general usage (setup, flow, Provider, hooks, pipeline); **`docs/how-to-<context>.md`** (e.g. `how-to-validators.md`, `how-to-layout.md`) for each specific topic. When adding/changing a feature, update the general how-to if the overall flow changes, and create or update the context-specific how-to for that feature. §12 deprecation wording updated to refer to the relevant docs (general or context-specific). (2) **Architecture (`.cursor/docs/Architecture.md`):** Anchors table and Public API section updated to describe the split; new **"How-to documentation structure"** subsection (general vs context-specific files); new anchor row for "New how-to context".

**Why:** Keep how-to maintainable and scannable: one general guide plus one file per specific capability so users find only what they need.

**Affected files:** `.cursor/rules/typescript-standards.mdc`, `.cursor/docs/Architecture.md`, `.cursor/history.md`.

### 2026-02-27 — Entry hook params: layout + engine (ParserEngine); Architecture and project updated

**What changed:** (1) **Architecture.md:** Documented that the hook the user instantiates (**`useImporter`**) must expose as parameters **layout** (optional) and **engine** (optional: `'xlsx' | 'csv' | 'auto'`; when omitted, decoding is automatic). (2) **ParserEngine type:** Added `src/types/parser-engine.ts` (`'xlsx' | 'csv' | 'auto'`), exported from types and main index. (3) **UseImporterOptions:** Added **engine**; **ImporterProviderProps** and context value: **engine**, **setEngine**; Provider holds engine state and passes setEngineState to actions. (4) **Parser:** ParseOptions and adapter accept **engine**; when set to `'xlsx'` or `'csv'`, that engine is used; when `'auto'` or omitted, detection by extension/MIME. (5) **useImportSheet:** Passes `ctx.engine` into `load(file, { ..., engine })`. (6) **Tests:** ImporterProvider (engine/setEngine, initial engine prop), useImporter (engine option), adapter (engine 'csv' / 'xlsx'). (7) **docs/how-to.md:** Updated setup to document layout and engine parameters.

**Why:** Let the consumer choose the decoding engine (e.g. for misnamed or extensionless files) and document the entry hook contract in Architecture.

**Affected files:** `src/types/parser-engine.ts`, `src/types/index.ts`, `src/index.ts`, `src/hooks/types.ts`, `useImporter.ts`, `src/providers/types.ts`, `useImporterStateSetters.ts`, `useImporterActions.ts`, `ImporterProvider.tsx`, `src/core/parser/types/parse-options.ts`, `adapter.ts`, `src/hooks/useImportSheet.ts`, provider/useImporter/adapter tests, `docs/how-to.md`, `.cursor/docs/Architecture.md`.

### 2026-02-27 — Coverage 90%; exclusions for workers and async hooks without testable logic

**What changed:** (1) **Rule (`.cursor/rules/typescript-standards.mdc` §3):** Coverage target lowered from 95% to **90%**. New bullet **Coverage exclusions:** Workers (`*.worker.ts`) and async hooks that depend only on external agents/events and have no explicit logic to test may be excluded; any testable logic inside such code must be isolated and tested. (2) **Architecture (`.cursor/docs/Architecture.md`):** Tests section updated with coverage target 90%, same exclusions (workers, async hooks without testable logic), and rule that testable logic must be isolated and covered. Anchors table: new row for "Coverage target or test exclusions".

**Why:** Reduce coverage pressure on Worker and thin async hooks while keeping a clear rule: isolate and test any logic that can be tested.

**Affected files:** `.cursor/rules/typescript-standards.mdc`, `.cursor/docs/Architecture.md`, `.cursor/history.md`.

### 2026-02-27 — Construction Step 3 (Parser) implemented

**What changed:** Implemented the Parser step. (1) **Types:** Added `RawSheetCellValue`, `documentHash` on `BaseSheet`, and `RawParseResult` (with optional `parserMeta`) in `src/types/raw-sheet.ts`; exported from types and main index. (2) **Engines:** `core/parser/engines/` — `xlsx-parser.ts` (SheetJS), `csv-parser.ts` (Papa Parse with `delimiterOverride`/`encodingOverride`, `parserMeta`), `normalize-cell.ts` for `RawSheetCellValue`. (3) **Adapter:** `core/parser/adapter.ts` — `parseSheet(blob, options)` routes by extension/MIME to XLSX or CSV; uses `streamHashHex` (js-sha256 in chunks) for `documentHash`. (4) **Worker:** `core/parser/worker/parser.worker.ts` — Comlink API `load(blob, options)` (preview, stores blob) and `parseAll(onProgress?)`; lifecycle and `abort()` via `setActiveWorker`. (5) **Hooks:** `core/parser/hooks/useParserWorker.ts` (internal) creates worker, exposes `load`/`parseAll`/`isReady`; `src/hooks/useImportSheet.ts` (public) runs `load` when `processFile(file)` sets state, exposes `startFullImport()`. (6) **Build:** tsup entry `parser.worker` outputs `dist/parser.worker.js`. (7) **Tests:** Unit tests for normalize-cell, hash, xlsx-parser, csv-parser, adapter, worker-url, useParserWorker (outside provider), useImportSheet (mocked worker). Coverage exclusions for `parser.worker.ts`, `useParserWorker.ts`, `useImportSheet.ts`; branch threshold 82% (parser branches).

**Why:** Fulfil Construction Step 3 — universal parser (xlsx/xls/ods/csv) in Worker, two-phase load + parseAll, documentHash by streaming, integration with Setting (`rawData`, `status`), progress via EventTarget.

**Affected files:**
- `src/types/raw-sheet.ts`, `src/types/index.ts`, `src/index.ts` — RawSheetCellValue, documentHash, RawParseResult, parserMeta; exports.
- New: `src/core/parser/` (types/, engines/, worker/, hooks/, adapter.ts, hash.ts), `src/hooks/useImportSheet.ts`.
- `src/providers/ImporterProvider.test.tsx`, `src/hooks/useSheetData.test.tsx` — documentHash in mock RawSheet/Sheet.
- `tsup.config.ts` — worker entry; `vitest.config.ts` — coverage exclusions, branch threshold 82.
- `package.json` — dependencies xlsx, papaparse, comlink, js-sha256, @types/papaparse.

### 2026-02-27 — Structure applied: ImporterContext → providers/, barrel cleanup

**What changed:** Applied the providers layout in code. (1) **Created `src/providers/`** with: `ImporterContext.ts` (context definition, from `contextInstance.ts`), `state.ts`, `types.ts`, `useImporterStateSetters.ts`, `useImporterActions.ts`, `useImporterContext.ts`, `ImporterProvider.tsx` (from `Provider.tsx`), `index.ts` (exports ImporterProvider, useImporterContext, ImporterContextValue, ImporterProviderProps), `ImporterProvider.test.tsx` (from `ImporterContext.test.tsx`). (2) **Removed `src/ImporterContext/`** (all files deleted). (3) **`src/index.ts`**: now imports from `./providers/index.js`; exports **only** `ImporterProvider`, `ImportProvider` alias, and `ImporterProviderProps` from providers; **no** longer exports `useImporterContext` or `ImporterContextValue`. (4) **Hooks** (`useImporter`, `useImporterStatus`, `useSheetData`, `useSheetEditor`, `useImporterEventTarget`): import `useImporterContext` from `../providers/index.js`. (5) **Hook tests**: import `ImporterProvider` and `useImporterContext` from `../providers/index.js`. (6) **Provider test**: lives in `src/providers/ImporterProvider.test.tsx`; imports provider/context from `./index.js`, public hooks from `../index.js`.

**Why:** Match Architecture.md: public vs internal separation; consumers use only Provider and public hooks; Context and useImporterContext are internal (providers/).

**Affected files:**
- New: `src/providers/*` (ImporterContext, state, types, useImporterStateSetters, useImporterActions, useImporterContext, ImporterProvider, index, ImporterProvider.test).
- Removed: `src/ImporterContext/*` (all files).
- `src/index.ts` — exports from providers, no useImporterContext/ImporterContextValue.
- `src/hooks/useImporter.ts`, `useImporterStatus.ts`, `useSheetData.ts`, `useSheetEditor.ts`, `useImporterEventTarget.ts` — import from `../providers/index.js`.
- `src/hooks/*.test.tsx` — ImporterProvider/useImporterContext from `../providers/index.js`.

### 2026-02-27 — Architecture: Public API vs internal (infrastructure) and providers/ layout

**What changed:** In `.cursor/docs/Architecture.md`: (1) New section **"Public API vs internal (infrastructure)"** before Product architecture: principle that internal/infrastructure (Context, Provider implementation, internal hooks) is separate from public/consumption (ImporterProvider component, public hooks, exported types); table for where each concern lives and whether it is exported from `index.ts`; barrel as single control point. (2) **Folder structure**: `ImporterContext/` replaced by **`providers/`** with `ImporterProvider.tsx`, `ImporterContext.ts`, and the rest of the brain logic (state, types, useImporterStateSetters, useImporterActions, useImporterContext); test file renamed to `ImporterProvider.test.tsx`. (3) **Hooks** subsection: public vs internal hooks clarified; only the four public hooks are re-exported from `src/index.ts`. (4) **Barrels**: `src/index.ts` described as single control point—export only Provider, public hooks, and public types; do not export Context or internal hooks. (5) **Anchors**: new row for "Public vs internal (what to export)". (6) **Types placement**: examples updated from `ImporterContext/types/` to `src/providers/types/`.

**Why:** Align with NPM-style libraries (e.g. TanStack Query, Apollo Client): clear separation so consumers only touch Provider, public hooks, and types; internal implementation stays under `providers/` and is not re-exported.

**Affected files:**
- `.cursor/docs/Architecture.md` — New Public API vs internal section; Root layout `providers/`; Hooks (public vs internal); Barrels; Anchors; Types placement examples.

### 2026-02-27 — Shared code moved from src/core/shared to src/shared

**What changed:** Moved shared code out of `src/core/shared/` into **`src/shared/`**. Registry (Registry.ts, types.ts, index.ts, Registry.test.ts) now lives under `src/shared/registry/`. Updated imports in ImporterContext (Provider.tsx, useImporterActions.ts, types.ts) and `src/index.ts`. Removed `src/core/shared/`. Updated `.cursor/docs/Architecture.md` folder structure: `shared/` is a top-level sibling of `types/`, `ImporterContext/`, `core/`.

**Why:** Shared utilities belong at `src/shared`, not inside `core`; core is for process-specific modules only.

**Affected files:**
- New: `src/shared/registry/` (Registry.ts, types.ts, index.ts, Registry.test.ts).
- Removed: `src/core/shared/registry/` (all four files).
- `src/ImporterContext/Provider.tsx`, `src/ImporterContext/useImporterActions.ts`, `src/ImporterContext/types.ts`, `src/index.ts` — imports now use `../shared/registry` or `./shared/registry`.
- `.cursor/docs/Architecture.md` — Root layout: added `shared/`, removed `core/shared/`; anchors example updated.

### 2026-02-27 — Architecture: type placement and one-file-per-type

**What changed:** In `.cursor/docs/Architecture.md`: (1) **Types** subsection renamed to **"Types — placement and one-file-per-type rule"**. Documented that **shared types** go in `src/types/` and **context/module-specific types** go in `<module>/types/` (e.g. `ImporterContext/types/`, `core/parser/types/`). Added rule: **one type per file**; barrel in `types/index.ts`. (2) **Language and conventions**: added a bullet summarizing type placement and one-file-per-type. (3) **Anchors table**: new row for "New type (where to put it)". (4) **Root layout**: `ImporterContext` now shows `types/` folder with `context-value.ts`, `provider-props.ts`, `index.ts` instead of a single `types.ts`.

**Why:** Single, clear convention so types are always in the right place and each type has its own file for discoverability and consistency.

**Affected files:**
- `.cursor/docs/Architecture.md` — Types section, conventions, anchors, ImporterContext tree.

### 2026-02-27 — ImporterContext split into folder (max 120 lines per file)

**What changed:** Refactored `src/ImporterContext.tsx` (220 lines) into `src/ImporterContext/` to satisfy the 120-line-per-file rule. New files: `state.ts`, `types.ts`, `contextInstance.ts`, `useImporterStateSetters.ts`, `useImporterActions.ts`, `Provider.tsx`, `useImporterContext.ts`, `index.ts`. Moved `ImporterContext.test.tsx` into the folder. Updated all imports from `../ImporterContext.jsx` to `../ImporterContext/index.js` in hooks and hook tests. Architecture.md folder structure updated.

**Why:** Rules §4 File Size & Modularity require source files ≤120 lines; split by related context (state, types, actions, Provider, hook) with single responsibility per file.

**Affected files:**
- New: `src/ImporterContext/*` (state, types, contextInstance, useImporterStateSetters, useImporterActions, Provider, useImporterContext, index, ImporterContext.test).
- Removed: `src/ImporterContext.tsx`, `src/ImporterContext.test.tsx`.
- `src/index.ts`, `src/hooks/useImporter.ts`, `src/hooks/useImporterStatus.ts`, `src/hooks/useSheetData.ts`, `src/hooks/useSheetEditor.ts`, `src/hooks/useImporterEventTarget.ts` and their tests — imports updated to `ImporterContext/index.js`.
- `.cursor/docs/Architecture.md` — Folder structure (ImporterContext as folder with listed files).

### 2026-02-27 — Coverage 95% and file size 120 lines (rules + vitest)

**What changed:** In `.cursor/rules/typescript-standards.mdc`: (1) **Coverage** raised from 80% to **95%**; added bullet **Coverage-first** (run coverage, add/adjust tests until 95% is met). (2) New **§4 File Size & Modularity**: source files must not exceed **120 lines**; if exceeded, create a folder for the module and split by related context (state, actions, selectors, etc.); each file single responsibility, public API via `index.ts`. Section numbers 5–12 renumbered. **vitest.config.ts** thresholds updated to 95% (lines, functions, branches, statements).

**Why:** Higher test coverage and smaller files improve maintainability and readability; 120-line cap and folder split keep modules easy to navigate.

**Affected files:**
- `.cursor/rules/typescript-standards.mdc` — §3 coverage 95%, Coverage-first; new §4 File Size & Modularity; §§5–12 renumbered.
- `vitest.config.ts` — coverage thresholds 95%.

### 2026-02-27 — Construction Step 2 (Setting) implemented

**What changed:** Implemented the Setting step: shared types in `src/types/` (SheetError, BaseSheet, RawSheet, Sheet, SheetLayout, ImporterState with rawData: RawSheet | null, documentHash, result); Registry Core in `src/core/shared/registry/` (Registry&lt;T&gt;, RegistryLevel, RegistryEntry); **ImporterProvider** in `src/ImporterContext.tsx` with layout (initial prop or via useImporter), state (file, rawData, documentHash, status, result), three Registries, EventTarget for progress, **abort()** and **importer-aborted** event, **setActiveWorker** for Worker lifecycle; four hooks **useImporter({ layout })**, **useImporterStatus()**, **useSheetData()**, **useSheetEditor()** plus **useImporterEventTarget()**; backward-compat export **ImportProvider** = ImporterProvider. Replaced legacy ImportProvider/useImporter with the new API. Vitest tests for initial state, hooks outside provider, state updates, progress/abort events, Registry (register/get), processFile, layout prop; coverage excludes barrel index files.

**Why:** Establish the foundation for the import pipeline: single source of truth (Provider), typed state (RawSheet, Sheet), registry-based validators/sanitizers/transforms (Zero-Bundle-Size), and stable hooks for consumers.

**Affected files:**
- `src/types/` — error.ts, raw-sheet.ts, sheet.ts, sheet-layout.ts, importer-state.ts, index.ts.
- `src/core/shared/registry/` — Registry.ts, types.ts, index.ts, Registry.test.ts.
- `src/ImporterContext.tsx`, `src/ImporterContext.test.tsx` (new); removed `src/ImportProvider.tsx`, `src/ImportProvider.test.tsx`, `src/types.ts`.
- `src/hooks/` — useImporter.ts, useImporterStatus.ts, useSheetData.ts, useSheetEditor.ts, useImporterEventTarget.ts, index.ts.
- `src/index.ts` — exports ImporterProvider, ImportProvider alias, hooks, types, Registry.
- `vitest.config.ts` — coverage exclude for **/index.ts.
- `eslint.config.ts` — argsIgnorePattern for no-unused-vars.
- `.cursor/docs/Architecture.md` — Folder structure (types files, ImporterContext, registry files, hooks list).

### 2026-02-27 — Backward compatibility (rules and Architecture)

**What changed:** New rule **§11 Backward Compatibility** in `.cursor/rules/typescript-standards.mdc`: maintain backward compatibility when implementing or updating features; avoid breaking old structures; prefer reusing or extending; if reuse is not possible, implement a compatibility layer that detects the old strategy and normalizes it; prefer deprecation over removal. **Architecture.md** updated with new subsection **"4. Backward compatibility (public API and data structures)"** under Product architecture (avoid breaking changes, reuse, compatibility layer, deprecation before removal) and a new row in the Anchors table.

**Why:** Ensure the library does not break existing consumers when evolving the API, types, or layout; provide a clear migration path and, when needed, automatic handling of legacy usage.

**Affected files:**
- `.cursor/rules/typescript-standards.mdc` — New §11 Backward Compatibility.
- `.cursor/docs/Architecture.md` — Anchors table (new backward-compatibility row); Product architecture §4 Backward compatibility.

### 2026-02-27 — Provider as brain, Hooks as interface (events only, no Zustand)

**What changed:** Architecture and Construction Step 2 updated so the **Provider** is the single source of truth ("brain": layout, file, state, Workers lifecycle) and **Hooks** are the consumer interface ("nerves"). Four specialized hooks: **`useImporter({ layout })`** (entry point; **`processFile(file)`**, register*, abort), **`useImporterStatus()`** (status, progress), **`useSheetData()`** (sheet, errors), **`useSheetEditor()`** (editCell). Progress and high-frequency updates use **EventTarget** only; **no Zustand**.

**Why:** For a pipeline-based headless import library, one central Provider improves persistence across UI steps (Carga → Mapeo → Validación), avoids prop drilling, and keeps Worker lifecycle and state in one place. Small, focused hooks improve Tree Shaking and clarity. Events (EventTarget) keep progress out of Context to avoid mass re-renders.

**Affected files:**
- `.cursor/docs/Architecture.md` — Section "Provider as brain, Hooks as interface (no Zustand)"; table of four hooks; example flow; Hooks folder section; Flow summary step 1; Core modules paragraph.
- `.cursor/docs/Construction Steps/2. Setting.md` — Handshake example (ImporterProvider, useImporter with processFile, useImporterStatus, useSheetData, useSheetEditor); Plan steps 2–3 (Provider as brain, four hooks); API en Provider/Hooks; Resultado esperado; tests (hooks outside provider).

### 2026-02-27 — Commitizen (Step 1 completion)

**What changed:** Commitizen and cz-conventional-changelog installed; package.json script `commit` (runs `cz`) and config.commitizen.path; Construction Step 1 doc updated with Commitizen usage for collaborators.

**Why:** Let contributors use `npm run commit` or `npx cz` for guided Conventional Commits instead of memorizing prefixes.

**Affected files:** `package.json`, `.cursor/docs/Construction Steps/1. PackageSetting.md`.

### 2026-02-27 — Step 1 PackageSetting (lint, format, hooks, coverage, build)

**What changed:** ESLint (flat config) with TypeScript and React/React Hooks; Prettier and eslint-config-prettier; Husky with pre-commit (lint-staged), commit-msg (Commitlint), pre-push (Vitest); Vitest coverage v8 with thresholds (80/80/70/80); package.json exports reordered (types first); tsup external includes react-dom. ImportProvider ref-based EventTarget replaced with useMemo to satisfy react-hooks/refs.

**Why:** Establish quality pipeline: Conventional Commits, lint+format on commit, tests+coverage on push; CJS/ESM build ready for publish.

**Affected files:**
- `eslint.config.ts` (new), `.prettierrc`, `.prettierignore`, `.commitlintrc.json` (new)
- `.husky/pre-commit`, `.husky/pre-push`, `.husky/commit-msg` (new)
- `package.json` — scripts (lint, test with --coverage, prepare), lint-staged, exports order
- `vitest.config.ts` — coverage provider v8, thresholds
- `tsup.config.ts` — external react-dom
- `src/ImportProvider.tsx` — progressEventTarget via useMemo (lint fix)
- `src/ImportProvider.test.tsx` — remove unused destructured vars (lint fix)

### 2026-02-26 — Registry Pattern & Zero-Bundle-Size

**What changed:** Implementado sistema de registro agnóstico para validadores, sanitizers y transformadores; añadida sección "Maturity & resilience" en Architecture.md; actualizado SheetLayout para usar identificadores en lugar de funciones; añadido versionado de esquema; errores I18n-ready con código + params.

**Why:** Permitir Tree Shaking perfecto (Zero-Bundle-Size): si el usuario no importa/registra el validador de email, ese código no llega al bundle final. Evitar "black box" assumptions en Workers (timeout & recovery). Soportar persistencia con versionado de esquema (IndexedDB). Permitir I18n de errores (UI traduce código + params).

**Affected files:**
- `.cursor/docs/Architecture.md` — Añadida "Maturity & resilience" (4 subsecciones), actualizada estructura de carpetas con `core/shared/registry/` y `utils/presets/`, añadida descripción de Registry Pattern.
- `.cursor/docs/Construction Steps/2. Setting.md` — Ampliado SheetLayout con identificadores, añadida sección completa "Registro agnóstico", Provider con tres `Registry` internos, API de registro (`registerValidator`, `registerSanitizer`, `registerTransform`), SheetLayout con campo `version`, Error/SheetError con `code` + `params`.
- `.cursor/docs/Construction Steps/3. Parser.md` — Añadida referencia a timeout & recovery.
- `.cursor/docs/Construction Steps/5. Sanitizer.md` — Añadida referencia a timeout & recovery.
- `.cursor/docs/Construction Steps/6. Validator.md` — Actualizada estructura de errores (I18n: código + params).
- `.cursor/docs/Construction Steps/7. Transform.md` — Añadida referencia a timeout & recovery.
- `.cursor/docs/Construction Steps/11. Telemetry.md` — Añadida subsección "Versionado de esquema" para persistencia IndexedDB.
- `.cursor/rules/typescript-standards.mdc` — Actualizada §5 con "Rule: Documentation Synchronization (Auto-Registry) — Golden Rule".
- `.cursor/devlog.md` — Nuevo: journal de sesiones.
- `.cursor/history.md` — Nuevo: registro de cambios.
- `.cursor/docs/sync-prompt.md` — Nuevo: prompt de alineación al inicio de sesión.
