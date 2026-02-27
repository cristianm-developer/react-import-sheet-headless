# Change registry (history)

**Purpose:** Brief log of what changed, why, and which files were affected. Used for audit-before-proceeding and to keep context across sessions. One entry per logical change; most recent first.

See also: `.cursor/devlog.md` (session journal with technical decisions), `CHANGELOG.md` (optional, at package root, for user-facing releases).

---

## Entries

<!-- HISTORY_ENTRIES -->

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
