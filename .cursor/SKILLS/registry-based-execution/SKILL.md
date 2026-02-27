---
name: registry-based-execution
description: Enforces the Registry pattern for Validators and Transforms so no raw functions are passed to Workers. Use when implementing SheetLayout, Validator/Transform logic, or adding new validators/transforms so the Worker resolves logic by string id from a registry.
---

# Registry-Based Execution

## When This Applies

- Implementing or changing **SheetLayout** (layout that describes validators/transforms per cell or row)
- Adding or changing **Validator** or **Transform** logic that runs in the Worker
- Designing how the Worker discovers and runs validation/transform logic (e.g. “is-email”, “trim-whitespace”)

## Problem

Functions **cannot** be passed to the Worker via `postMessage`/Comlink (they are not serializable). Passing many function references via Comlink proxies would be expensive and fragile. The Worker must have a way to run logic identified by the layout **without** receiving functions from the Main Thread.

## Rule: Registry pattern, no raw functions in the Worker

### 1. Layout contains only string identifiers

- **SheetLayout** must **not** hold raw functions (e.g. no `validator: (v) => ...`).
- It must hold **string identifiers** only, e.g. `'is-email'`, `'trim-whitespace'`, `'required'`.
- The same identifier is used in the Main Thread (for types/docs) and in the Worker (for lookup).

### 2. Worker-side registries

- The Worker has a **ValidatorRegistry** and/or **TransformRegistry** (or a single registry that maps context to registries).
- Each registry **maps string id → implementation** (the actual function or logic that runs in the Worker).
- When the Worker runs validation or transformation, it looks up the id from the layout in the registry and executes the registered implementation.

### 3. Where implementations live

- Implementations (the real logic) live in **`src/utils/controller`** (or the project’s controller/utils path), organized by context (e.g. cell validators, row validators, cell transforms).
- They are **registered** in the Worker’s entry or in a dedicated registry module that the Worker imports (e.g. register `'is-email'` → `isEmailValidator`).

### 4. Adding a new validator or transform

When a new validator (or transform) is requested:

1. **Implement** it in `src/utils/controller` (or the agreed module), following existing patterns.
2. **Register** it in the Worker: add the string id and the implementation to the appropriate **ValidatorRegistry** or **TransformRegistry** so the Worker can resolve it by id when processing the layout.

Do **not** pass the new function from the Main Thread; the Worker must resolve it by id from its registry.

## Verification

- [ ] SheetLayout uses only **string identifiers** (e.g. `'is-email'`), never raw functions.
- [ ] Worker has **ValidatorRegistry** and/or **TransformRegistry** that map those ids to implementations.
- [ ] New validators/transforms are implemented in `utils/controller` and **registered** in the Worker; no functions are sent from Main to Worker.
