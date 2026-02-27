---
name: zero-overhead-react-pattern
description: Keeps React as a thin view layer by restricting Context to stable data and avoiding unnecessary re-renders. Use when designing Context, hooks, or state updates so high-frequency updates are not stored in Context without a re-render strategy, and hooks expose stable references via useCallback/useMemo.
---

# Zero-Overhead React Pattern

## When This Applies

- Designing or changing **React Context** (what is stored and how it updates)
- Implementing **hooks** that expose functions or derived data to consumers
- Deciding where to put **progress**, **cell edits**, or other high-frequency updates

## Principle: React as a thin view layer

React is primarily a **presentation layer**. State and updates should be designed so that only the minimal part of the tree re-renders when data changes. Avoid patterns that cause large or frequent re-renders for the whole consumer tree.

## Rules

### 1. Context only for stable data

- Use **React Context** only as storage for **stable** or **low-frequency** data (e.g. sheet result, status, layout, event target reference).
- **Never** store **high-frequency updates** (e.g. progress tick-by-tick, individual cell edits as they happen) directly in Context **without** a strategy to prevent unnecessary re-renders (e.g. splitting context, refs, or external event target).

### 2. Strategy for high-frequency updates

If the app must expose progress or fine-grained updates:

- Prefer **EventTarget** + custom events (e.g. `importer-progress`) so only subscribers that need it update (e.g. progress bar with local state or ref).
- Or keep high-frequency data **out of Context** (e.g. in a ref or a separate channel) and document how consumers subscribe. See Architecture.md — *Progress and re-renders: EventTarget*.

### 3. Stable references in hooks

When generating **hooks** that expose functions or derived data to consumers:

- Use **`useCallback`** for **functions** (e.g. `editCell`, `parse`, `validate`) so their reference stays stable across renders unless dependencies change.
- Use **`useMemo`** for **derived data** (e.g. paginated rows, filtered list, computed values) so consumers that depend on reference equality do not re-render unnecessarily.

This ensures **reference stability** for consumers and avoids unnecessary re-renders when the hook is used in dependency arrays or memoized children.

## Verification

- [ ] Context does not hold high-frequency data without a re-render strategy.
- [ ] Hooks expose callbacks via **useCallback** and derived data via **useMemo** where appropriate for consumer stability.
