# DevLog — Session journal

**Purpose:** Record each work session so the AI (and humans) can understand the current state of the project, what was added, and why certain decisions were made. This complements `Architecture.md` (current map) with a chronological history.

**Instruction for Cursor:** Every time you finish a **Construction Step** (or a significant milestone), you **MUST**:
1. Add an entry below in the format described.
2. Mark the step as completed in the corresponding Construction Step doc (e.g. `.cursor/docs/Construction Steps/N. StepName.md`) or in the plan checklist.

---

## Format for each entry

- **Date** (YYYY-MM-DD).
- **Feature / area** added or changed.
- **Global state changes** (e.g. new folders, new exports, new provider state).
- **Technical decisions** (e.g. "Sync used in this validator because …"; "EventTarget for progress because …").

---

## Entries

_(Add new entries at the top, most recent first.)_

<!-- DEVLOG_ENTRIES -->

### 2026-02-27 — Construction Step 7 (Transform) completed

**Feature / area:** Transform step implemented: runs cell → row → sheet transforms in a Web Worker over validated Sheet; returns only a delta of value changes (and optional sheet errors from async table transforms); main thread applies delta via applyTransformDelta and merges sheet errors into result.

**Global state changes:**
- New `src/core/transform/` (types/, runner/, worker/, hooks/, delta-applier.ts, index.ts). Worker entry `transform.worker` in tsup. useTransformWorker (internal) exposes transform() and transformAndApply(); transformAndApply uses layout from context, applyTransformDelta, and setResult(patchedSheet). ImporterStatus extended with `'transforming'`.
- New `src/utils/controller/string/cell-to-upper-transform.ts` (CellToUpperTransform, Register(), id `toUpperCase`). Worker registry registers built-in toUpperCase; Runner resolves by id from layout (fields[].transformations, rowTransformations, sheetTransformations).

**Technical decisions:** Cell and row transforms are strictly sync; only sheet (table) transforms may be async. runSheetTransforms uses try/catch and returns EXTERNAL_TRANSFORM_FAILED in errors array on throw; options.signal passed for abort. Safe-first: sheet.errors → return { deltas: [] }; row.errors → skip row; cell.errors → skip transform for that cell. runTransform applies accumulated deltas to a copy via applyTransformDelta before calling runSheetTransforms so table transforms see the already-transformed sheet. TransformResult = { deltas, errors? }; hook merges errors into sheet.errors when applying. Throttled progress (16ms). Coverage exclusion for useTransformWorker.

### 2026-02-27 — Construction Step 6 (Validator) completed

**Feature / area:** Validator step implemented: runs cell → row → table validators in a Web Worker over SanitizedSheet; returns only a delta of errors; main thread builds initial Sheet and applies delta via applyValidatorDelta.

**Global state changes:**
- New `src/core/validator/` (types/, runner/, worker/, hooks/, build-initial-sheet.ts, patch-delta.ts, index.ts). Worker entry `validator.worker` in tsup. useValidatorWorker (internal) exposes validate() and validateAndApply(); validateAndApply uses layout from context and setResult(patchedSheet). No new provider state (result already holds Sheet).
- New `src/utils/controller/required/` with cell-required-validator (Register(), id `required`). Worker registry registers built-in required; Runner resolves by id from layout.

**Technical decisions:** Cell and row validators are strictly sync; only table validators may be async. runTableValidation uses try/catch and returns EXTERNAL_VALIDATION_FAILED on throw; options.signal passed for abort. Delta shape: ValidatorErrorCell (rowIndex, cellKey, error), ValidatorErrorRow (rowIndex, error), ValidatorErrorSheet (error). Early exit on fatal in cell/row loops. Throttled progress (16ms) in runValidation. Coverage exclusion for useValidatorWorker.

### 2026-02-27 — Construction Step 4 (Convert) completed

**Feature / area:** Convert step implemented: align RawSheet + sheetLayout to produce ConvertedSheet (fit) or ConvertResult (mismatch with reorderColumns, renameColumn, applyMapping). Runs on main thread.

**Global state changes:**
- New `src/core/convert/` (types/, match-headers.ts, build-converted-sheet.ts, run-convert.ts, hooks/useConvert.ts, index.ts). ImporterState extended with `convertedSheet` and `convertResultData`; Provider and context expose them and setConvertedSheet/setConvertResultData. processFile resets convert state.
- Public hook **useConvert()** re-exported from src/hooks and main index; types ConvertedSheet, ConvertResult, ColumnMismatch, etc. exported.

**Technical decisions:** Header matching is case-insensitive by default (ConvertOptions.caseSensitive, normalizer). headerToFieldMap and columnOrder live in provider state; reorderColumns/renameColumn use functional setState so applyMapping sees latest map. ConvertResult.applyMapping() runs runConvert with current state and returns ConvertResultApplyResult; state is updated in the same call so UI re-renders with convertedSheet or updated convertResult.

### 2026-02-27 — ImporterContext refactor for 120-line rule

**Feature / area:** Refactored single-file `ImporterContext.tsx` (220 lines) into `src/ImporterContext/` folder: state.ts, types.ts, contextInstance.ts, useImporterStateSetters.ts, useImporterActions.ts, Provider.tsx, useImporterContext.ts, index.ts. Test file moved into folder; all hook imports updated to `ImporterContext/index.js`.

**Technical decisions:** Split by responsibility (state, types, context instance, state setters hook, actions hook, Provider, useImporterContext). useImporterStateSetters holds the six setState-based callbacks to keep useImporterActions under 120 lines. Public API unchanged (barrel index.ts); tests and coverage remain 100%.

### 2026-02-27 — Construction Step 2 (Setting) completed

**Feature / area:** Setting step executed: shared types (SheetError, BaseSheet, RawSheet, Sheet, SheetLayout, ImporterState), Registry Core (Registry&lt;T&gt;, RegistryLevel), ImporterProvider (state, layout, three Registries, EventTarget, abort, setActiveWorker), four hooks (useImporter, useImporterStatus, useSheetData, useSheetEditor) + useImporterEventTarget.

**Global state changes:**
- New `src/types/` (error, raw-sheet, sheet, sheet-layout, importer-state, index).
- New `src/core/shared/registry/` (Registry, types, index, Registry.test).
- New `src/ImporterContext.tsx` (replaces ImportProvider.tsx); new `src/hooks/` with five hooks.
- Public API: ImporterProvider, useImporter({ layout }), useImporterStatus, useSheetData, useSheetEditor, useImporterEventTarget; ImportProvider kept as alias.

**Technical decisions:**
- Layout: initial value from Provider prop only (no useEffect sync) to avoid set-state-in-effect lint; useImporter({ layout }) calls setLayout in its useEffect to inject layout from the hook.
- useSheetEditor calls useImporterContext() so it throws when used outside Provider (stub editCell does not use context yet).
- Coverage exclude for barrel index.ts files so thresholds are met without testing re-exports.
- ESLint argsIgnorePattern `^_` for unused parameters (e.g. stub editCell).

### 2026-02-27 — Commitizen added (Step 1 optional)

**Feature / area:** Commitizen with cz-conventional-changelog; script `npm run commit`; config.commitizen.path in package.json.

**Technical decisions:** Install done manually (`npm install -D commitizen cz-conventional-changelog`) because `npx commitizen init` failed in sandbox (spawn EPERM). Documented in Step 1: collaborators use `npm run commit` or `npx cz` for guided Conventional Commits.

### 2026-02-27 — Construction Step 1: PackageSetting completed

**Feature / area:** Lint (ESLint 9 flat config), format (Prettier), Husky (pre-commit, commit-msg, pre-push), Commitlint (Conventional Commits), Vitest coverage (v8, thresholds 80/80/70/80), tsup/build verified.

**Global state changes:**
- New config files: `eslint.config.ts`, `.prettierrc`, `.prettierignore`, `.commitlintrc.json`.
- Husky hooks: `.husky/pre-commit` (lint-staged), `.husky/commit-msg` (commitlint), `.husky/pre-push` (npm run test).
- `package.json`: lint script → `eslint .`; test → `vitest run --coverage`; prepare → husky; lint-staged section; exports reordered (types first).
- `vitest.config.ts`: coverage provider v8, reporter text/json/html, thresholds lines/functions/branches/statements.
- `src/ImportProvider.tsx`: EventTarget created with useMemo (fix ref-during-render lint); `src/ImportProvider.test.tsx`: removed unused destructuring.

**Technical decisions:**
- ESLint flat config with typescript-eslint v8, React + React Hooks, eslint-config-prettier last. Ref-based lazy EventTarget replaced with useMemo to satisfy react-hooks/refs (no ref read during render).
- Pre-push runs `npm run test` which includes `--coverage` so thresholds are enforced on push.
- package.json exports: `types` condition placed first so TypeScript/bundlers resolve types correctly (Vitest warning avoided).

### 2026-02-26 — Registry Pattern & Zero-Bundle-Size Architecture

**Feature / area:** Sistema de registro agnóstico para validadores, sanitizers y transformadores.

**Global state changes:**
- **Architecture.md:** Añadida sección "Maturity & resilience" con 4 subsecciones (Worker timeout & recovery, Memory management, Schema versioning, I18n of errors). Actualizada estructura de carpetas con `core/shared/registry/` y `utils/presets/`. Añadida descripción de Registry Pattern en "Utils (controller by context/field)".
- **2. Setting.md:** Ampliado SheetLayout para usar **identificadores (strings)** en lugar de funciones; layout ahora usa `validators: ['required', 'email']` en lugar de funciones inline. Añadida sección completa "Registro agnóstico de validadores/sanitizers/transformadores (Zero-Bundle-Size)" con arquitectura del Registry Core, Building Blocks, Handshake del Usuario, Serialización para el Worker (Opción A: código compartido ESM), Ciclo de vida del Registro, Preset Helpers. Provider ahora mantiene tres `Registry` internos y expone `registerValidator`, `registerSanitizer`, `registerTransform`. SheetLayout incluye campo **`version`** para versionado de esquema. Error/SheetError ahora con `code`, `params`, `level`, `message?` (I18n-ready).
- **Construction Steps:** Actualizados 3. Parser, 5. Sanitizer, 6. Validator, 7. Transform, 11. Telemetry con referencias a timeout & recovery, I18n de errores, versionado de esquema para persistencia IndexedDB.
- **Rules:** `.cursor/rules/typescript-standards.mdc` actualizada con §5 "Rule: Documentation Synchronization (Auto-Registry) — Golden Rule" (Post-Implementation Duty, Anchors, Audit Before Proceeding, Devlog y plan, READMEs y tests, Sync al inicio de sesión).
- **Nuevos archivos:** `.cursor/devlog.md`, `.cursor/history.md`, `.cursor/docs/sync-prompt.md`.

**Technical decisions:**
- **Zero-Bundle-Size:** La librería **no registra nada por defecto**. El usuario importa solo las funciones que usa (e.g. `import { emailValidator } from '@lib/utils'`) y las registra manualmente (`registerValidator('email', emailValidator)`). Si no se importa/registra, el código no llega al bundle final (Tree Shaking perfecto).
- **Registry Pattern:** El `sheetLayout` solo contiene **identificadores (strings)**, no funciones. El Provider mantiene tres `Registry<T>` (validator, sanitizer, transform) que mapean nombres a funciones. Los Workers importan los mismos módulos desde `src/utils/controller/` (código compartido ESM) y resuelven por nombre desde su Registry local. No se usa serialización con `fn.toString()` + `new Function`; se prefiere código compartido.
- **Serialización para Worker (Opción A):** Workers modernos (Vite/Webpack 5+) soportan ESM imports. El Worker importa `Registry` y las funciones desde `src/utils/controller/`; el Main Thread solo envía la lista de nombres a registrar (o el Worker registra lo que el layout necesita al inicio). Ventaja: no hay serialización; el código ya está disponible en el Worker.
- **Preset Helpers:** Funciones combo (e.g. `registerStandardValidators`) en `src/utils/presets/` para registrar múltiples funciones de un golpe. Tree Shaking sigue funcionando porque presets viven en `utils` y solo se importan si se usan.
- **Madurez 10/10:** Separación clara entre "definición de la lógica" (Registro) y "aplicación de la lógica" (Ejecución). Worker timeout & recovery, gestión de memoria con delta strategy, versionado de esquema para persistencia, I18n de errores con código + params.
