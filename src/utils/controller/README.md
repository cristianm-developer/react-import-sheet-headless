# Controllers: validators, sanitizers, transforms

Controllers are building blocks grouped by **field/context** (e.g. `required`, `string`), not by type. Each context folder holds all sanitizers, validators, and transforms for that domain at every level.

For folder structure and pipeline flow, see [Architecture](../../../.cursor/docs/Architecture.md).

## Execution order

**Cell → row → sheet (table).**

- Sanitizer, Validator, and Transform runners execute in this order: first all cell-level, then row-level, then one table-level pass at the end.
- Cell and row steps are **synchronous**; only **table**-level steps may be **async** (e.g. backend checks).

## Naming and layout

- **File naming:** `{level}-{context}-{type}.ts` — e.g. `cell-email-sanitizer.ts`, `row-email-validator.ts`, `table-email-transform.ts`. Levels: `cell`, `row`, `table`.
- **Layout:** The layout references controllers by **string id** (e.g. `validators: ['required', 'email']` or `{ name: 'in-list', params: { list: [...] } }`). The Provider maintains three **Registry** instances (validator, sanitizer, transform); Workers resolve by id from their own registry (same ESM modules or serialized functions).

## How to implement a controller

1. Create a folder under `controller/` for the context (e.g. `email/`, `phone/`).
2. Add files following `{level}-{context}-{type}.ts` and export the function and a **Register()** helper that returns the string id and optionally registers with the Provider’s register API.
3. Export from the controller barrel so the Worker can import and the Runner can resolve by id. All configuration must go via **params** in the layout (no closures) so code is Worker-safe.

## Controllers in this repo

| Context   | Contents |
|-----------|----------|
| **required** | [cell-required-validator](required/cell-required-validator.ts) — `required` (cell). |
| **string**   | [cell-trim-sanitizer](string/cell-trim-sanitizer.ts), [cell-to-upper-transform](string/cell-to-upper-transform.ts) — `trim`, `toUpperCase` (cell). |

← [Back to README](../../../README.md) · [Architecture](../../../.cursor/docs/Architecture.md)
