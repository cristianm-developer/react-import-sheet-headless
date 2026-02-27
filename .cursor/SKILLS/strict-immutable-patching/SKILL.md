---
name: strict-immutable-patching
description: Enforces structural sharing and minimal updates when changing Sheet state in the Provider or Editor. Use when updating sheet/rows/cells state, implementing setState in the Provider, or editing logic so large lists do not re-render entirely and closures stay correct.
---

# Strict Immutable Patching

## When This Applies

- Updating **Sheet** state in the Provider or Editor
- Implementing or changing `setState` (or equivalent) for `sheet` / `rows` / `cells`
- Any logic that mutates or replaces the sheet/rows structure

## Rules

### 1. Use structural sharing

Only the **modified Row** and its parent **Sheet** reference should change. Do not clone or replace the entire `rows` array when a single row or cell changes.

- **Wrong:** `state = { ...state, rows: newRows }` where `newRows` is a full copy of the array.
- **Right:** Build a new `rows` array that reuses all unchanged row references and only replaces the one row that changed (and optionally new Sheet reference if needed).

Assume the consumer uses **virtualization**; unnecessary reference changes on untouched rows cause extra re-renders and hurt performance.

### 2. Prefer functional updates for state

Use **functional updates** so you always work with the latest state and avoid stale closures:

- **Prefer:** `setState(prev => ...)` (or the project’s equivalent).
- **Avoid:** Reading `state` from closure and calling `setState({ ...state, ... })`, which can overwrite concurrent updates and close over stale data.

### 3. Cell-only changes must not force full-list re-renders

If a change affects **only a cell** (or a single row):

- Do **not** replace the whole sheet or the entire `rows` list.
- Patch only the affected row (new row object), and keep the same array reference for all other rows.
- Rely on the consumer’s virtualization; only the changed row (and its cells) should be considered “dirty” from a reference standpoint.

## Summary

- **Structural sharing:** Only changed row + parent sheet (and path to it) get new references.
- **Functional updates:** `setState(prev => ...)`.
- **Scope updates to the minimal subtree:** Cell/row changes must not trigger a full-list re-render; assume virtualization.
