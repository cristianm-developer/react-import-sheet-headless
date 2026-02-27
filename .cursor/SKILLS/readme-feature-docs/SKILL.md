---
name: readme-feature-docs
description: Keeps README and linked docs in sync when new features are integrated. Use when adding or changing hooks, provider API, validators, transformers, pipeline steps, or usage flows so the main README, docs/how-to.md, docs/validators.md, docs/transformers.md, and Architecture.md stay accurate and discoverable.
---

# Adding New Features to the README and Docs

When you integrate a new feature (hook, provider API, validator, transformer, or pipeline change), update the documentation so users can discover and use it without reading source code. This skill follows the plan in `.cursor/docs/Construction Steps/7. Readme.md` and the structure in `.cursor/docs/Architecture.md`.

## When to Apply

- Adding or changing a **public hook** (e.g. `useSheetView`, `useImporter`, `useConvert`)
- Adding or changing **provider API** (e.g. `editCell`, `getPaginatedResult`, progress/EventTarget)
- Adding a **new validator** or **transform** (registry id + implementation)
- Changing **pipeline order** or **data flow** (e.g. Convert, Sanitizer, Validator, Transform, Edit)
- Adding **new usage flows** (e.g. virtualisation, persistence, clearSession)

## Where to Update

| Change type | README (root) | docs/how-to.md | docs/validators.md | docs/transformers.md | Architecture.md |
|-------------|---------------|----------------|--------------------|----------------------|------------------|
| New hook / provider API | Quick Start or How to link | New recipe or step-by-step | — | — | Hooks / Provider section |
| New validator | Schema Docs summary + link | If usage example needed | Add row to table + doc | — | — |
| New transformer | Schema Docs summary + link | If usage example needed | — | Add row to table + doc | — |
| Pipeline / flow change | Pipeline diagram or text | Affected recipes | — | — | Flow summary + diagram |

## Step-by-Step Workflow

### 1. Main README (`README.md`)

- **Quick Start:** If the feature is the primary way to use the library, update the ~10-line example (e.g. `useSheetView`, `getPaginatedResult`). Keep it copy-paste runnable.
- **How to:** Ensure the "How to (usage)" section links to `docs/how-to.md` and, if relevant, mentions the new capability in one sentence.
- **Schema Docs:** For new validators or transformers, add the name and level (cell | row | sheet) to the summary and ensure the link to `docs/validators.md` or `docs/transformers.md` is correct. Do not put full docs in the README.
- **Pipeline:** If the data flow changed (e.g. Convert before Sanitizer), update the pipeline sentence or Mermaid/diagram so it matches Architecture.

### 2. docs/how-to.md (Cookbook)

- Add or update **recipes** that show how to use the new feature (e.g. "How to virtualise large sheets with getRows", "How to clear session after successful upload").
- Each recipe: clear title, minimal code, and link back to README if needed.
- Remove or rewrite recipes that are outdated by the change.

### 3. docs/validators.md

- Add a **table row** in the compatibility table: Validador | Nivel | Parámetros | Ejemplo.
- Add a short section for the new validator (options, params, example).
- Keep "← Back to README" at the top.

### 4. docs/transformers.md

- Add a **table row** in the compatibility table: Transformador | Nivel | Parámetros | Ejemplo.
- Add a short section for the new transformer (options, params, example).
- Keep "← Back to README" at the top.

### 5. Architecture.md

- **Flow summary:** Update the numbered flow (0. Setting … 6. Edit) if a step was added or reordered.
- **Folder structure / Core modules:** Update the table or tree if new modules or hooks were added.
- **Provider / Hooks:** Update the list of what the provider exposes (status, result, errors, edit, EventTarget) or the list of public hooks.

## Rules (from typescript-standards.mdc)

- **Usage Sync:** Update `docs/how-to.md`, `docs/validators.md`, or `docs/transformers.md` when hooks or API options change. Users must not need to read source to understand usage.
- **Architecture Sync:** Update `.cursor/docs/Architecture.md` right after changing folders, flows, or exports.

## Checklist Before Finishing

- [ ] README Quick Start still runs in a clean Vite app (reproducibility).
- [ ] From any `docs/*` page, one click returns to the main README (navegabilidad).
- [ ] New validators/transformers appear in the right table and linked doc; README only summarizes and links.
- [ ] Architecture.md flow and module list match the current code and pipeline.

## Reference

- Full README plan and section order: [7. Readme.md](.cursor/docs/Construction%20Steps/7.%20Readme.md)
- Folder structure and pipeline: [Architecture.md](.cursor/docs/Architecture.md)
- Doc sync rule: `.cursor/rules/typescript-standards.mdc` (§ Documentation Sync)
