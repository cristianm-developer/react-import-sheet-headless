# Change registry (history)

**Purpose:** Brief log of what changed, why, and which files were affected. Used for audit-before-proceeding and to keep context across sessions. One entry per logical change; most recent first.

See also: `.cursor/devlog.md` (session journal with technical decisions), `CHANGELOG.md` (optional, at package root, for user-facing releases).

---

## Entries

<!-- HISTORY_ENTRIES -->

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
