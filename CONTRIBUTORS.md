# Contributing to react-import-sheet-headless

Thank you for your interest in contributing. This document describes how to contribute in a way that keeps the codebase consistent, maintainable, and backward-compatible.

---

## 1. Follow the project rules

All contributions **must** adhere to the standards and architecture already defined in this repo. The main references are:

- **`.cursor/rules/typescript-standards.mdc`** — TypeScript and workflow rules (clean code, strict types, testing, file size, architecture, documentation sync, performance, workers, delta-patching, pagination, type-first implementation, **backward compatibility**).
- **`.cursor/docs/Architecture.md`** — Folder structure, data flow (Parser → Convert → Sanitizer → Validator → Transform → View), core modules, public API vs internal, and design principles.

Before starting any change:

1. Read **`.cursor/docs/Architecture.md`** to understand data flow, folder layout, and responsibilities.
2. Read the **latest entries** in **`.cursor/history.md`** (and optionally **`.cursor/devlog.md`**) for recent decisions and current state.

Highlights you must respect:

- **Code:** English only; named exports; no JSDoc/inline comments except for 1-based ↔ 0-based pagination; strict TypeScript (no `any`); max 120 lines per source file; single responsibility; follow `core/<process>/[types|hooks|worker]`.
- **Tests:** Colocated `*.test.ts(x)` next to each source file; Vitest; descriptive `it('...')` text; coverage ≥ 90% (with allowed exclusions for workers and thin async hooks).
- **Documentation:** After any feature/type/hook change, update Architecture.md, the relevant how-to docs, `.cursor/history.md`, and `ai-context.md` when the public API or pipeline changes (see §6 in the TypeScript standards).
- **Backward compatibility:** Do **not** break existing usage. Prefer extending (new optional fields, overloads) over removing or renaming. Use a compatibility layer or deprecation with a migration path when the old structure cannot be reused.

---

## 2. Use Commitizen for commits

We use **Commitizen** with conventional commits so that history and changelogs stay consistent.

- **Create commits with:** `npm run commit` (runs `cz`).
- Use a short, clear subject and optional body. Follow the conventional types (e.g. `feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- Do **not** push raw `git commit -m "..."` for feature/fix/docs changes; use the Commitizen flow so the format is validated (and, if applicable, Commitlint passes).

---

## 3. Use Pull Requests and describe changes

- **All changes** should go through a **Pull Request** (PR). Do not push directly to the main/protected branch.
- In the PR description, **clearly state:**
  - **What** changed (files, behaviour, API surface).
  - **Why** the change was made (problem, goal, or user need).
  - **How** it fits the existing architecture (e.g. pipeline step, hook, type placement).
- If you introduce a new option, type, or breaking behaviour, explain the rationale and, for any breaking change, the migration path (we prefer avoiding breaking changes; see §4).

This helps reviewers and future maintainers understand and safely evolve the codebase.

---

## 4. Do not break backward compatibility

- **Avoid breaking changes** to the public API: no removal or renaming of public types, hook signatures, provider props, or layout/error shapes that would force consumers to change code without a migration path.
- **Prefer reuse and extension:** Add new optional fields or overloads instead of replacing or renaming existing ones.
- **Compatibility layer:** If the new design cannot reuse the old structure, implement a normalization step (e.g. detect legacy shape/version) so existing usage keeps working. Document the legacy form and any deprecation timeline.
- **Deprecation over removal:** Prefer deprecation (with docs and, if useful, runtime warnings) over immediate removal. Plan and document a migration path before removing deprecated APIs or structures.

If your PR introduces a breaking change, it must be justified and include a clear migration path; otherwise we will ask for a backward-compatible approach.

---

## 5. Using AI (including Cursor) to contribute

You are **encouraged** to use AI tools to implement or review contributions, as long as the **output complies with all rules** in this document and in the project (TypeScript standards, Architecture, Commitizen, PRs, backward compatibility).

- **This project is developed with Cursor.** In the repo you will find:
  - **`.cursor/rules/`** — Coding standards (e.g. `typescript-standards.mdc`) applied to the codebase.
  - **`.cursor/docs/`** — Architecture, construction steps, sync prompt, and other internal references.
  - **`.cursor/SKILLS/`** — Agent skills for patterns such as Commitizen, defensive errors, delta-first communication, dependency guard, registry-based execution, immutable patching, worker/main-thread separation, etc.

You may:

- Use **Cursor** and the existing **skills** and **docs** so the AI follows the same conventions (commits, errors, workers, registries, etc.).
- Use **another AI or editor** of your choice, as long as you (or the AI) **read and apply** the same rules: TypeScript standards, Architecture.md, Commitizen, PR description, and no breaking changes without a migration path.

The important point is **result**: the merged code and history must satisfy the project’s standards and compatibility guarantees, regardless of whether the author used Cursor, another AI, or no AI.

---

## 6. Summary checklist

Before submitting a PR, ensure:

- [ ] You have read `.cursor/docs/Architecture.md` and the relevant parts of `.cursor/rules/typescript-standards.mdc`.
- [ ] Code follows the TypeScript standards (English, named exports, strict types, file size, colocated tests, coverage).
- [ ] New or changed behaviour is covered by tests and the test suite passes (e.g. `npm test` / `npx vitest run`).
- [ ] Documentation is updated (Architecture.md, how-to docs, `.cursor/history.md`, and `ai-context.md` when the public API or pipeline changes).
- [ ] Commits were created with `npm run commit` (Commitizen).
- [ ] The PR description explains what changed, why, and how it fits the architecture.
- [ ] No backward-incompatible change was introduced without a justified reason and a migration path (or the change was reworked to be backward-compatible).

Thank you for contributing.
