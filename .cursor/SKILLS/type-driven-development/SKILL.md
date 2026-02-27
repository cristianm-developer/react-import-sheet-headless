---
name: type-driven-development
description: Enforces defining types before implementation and strict typing for pipeline stages. Use when implementing logic or hooks, adding pipeline stages, or defining sheet/row/cell structures so every stage has specific types and immutability is enforced with readonly.
---

# Type-Driven Development (Type TDD)

## When This Applies

- Before implementing any **logic** or **hook** that deals with sheet/row/cell data
- When adding or changing a **pipeline stage** (Parser → Sanitizer → Validator → Transform)
- When defining or evolving **sheet structures** and their contracts

## Rules

### 1. Define interfaces first in the types/ folder

- **Before** writing implementation code, define the **interfaces** (and related types) in the corresponding **`types/`** folder (e.g. `src/types/`, or per-module `core/parser/types/`, etc.).
- Types are the primary documentation for data flow; the implementation should satisfy these types.

### 2. No `unknown` for internal logic

- You are **not allowed** to use `unknown` for internal pipeline logic (e.g. “this row is unknown”).
- Create **specific types** for every stage of the pipeline, for example:
  - **RawRow** / RawSheet (output of Parser)
  - **SanitizedRow** / SanitizedSheet (output of Sanitizer)
  - **ValidatedRow** / ValidatedSheet (output of Validator, with errors)
  - **TransformedRow** / TransformedSheet (output of Transform)
- Use these types in function signatures and state so the data flow is explicit and type-safe.

### 3. Use `readonly` for sheet structures

- Use TypeScript **`readonly`** for sheet-like structures (e.g. `readonly Row[]`, `readonly Cell[]`, or readonly nested types) to **enforce immutability** at the type level.
- This prevents accidental mutations and aligns with structural sharing and immutable patching.

## Verification

- [ ] New or changed data shapes have corresponding types in `types/` before implementation.
- [ ] Internal pipeline code uses specific types (Raw*, Sanitized*, Validated*, Transformed*), not `unknown`.
- [ ] Sheet/row/cell structures are marked `readonly` where appropriate.
