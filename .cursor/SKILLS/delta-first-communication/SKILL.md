---
name: delta-first-communication
description: Prioritizes Delta responses from Workers instead of full Sheet objects. Use when implementing validation or transformation in Workers, or when applying Worker results on the Main Thread so only changes (deltas) are transferred and applied via an Applier.
---

# Delta-First Communication

## When This Applies

- Worker methods that **validate** or **transform** the sheet and need to send results back to the Main Thread
- Main Thread hooks or code that receive Worker results and update the local sheet state
- Any design decision between “return full Sheet” vs “return only what changed”

## Rule: Prefer Deltas, Not Full Sheet

**Do not** return the full **Sheet** object from the Worker after validation or transformation when the change set is small or localized. Large JSON payloads increase memory and main-thread work.

**Do**:

1. **Generate an array of changes (Deltas)** in the Worker. Each delta should identify **where** the change is and **what** the new data is, e.g. coordinates `[row, col]` (or `rowIndex`, `cellKey`) plus the new value/error/state.
2. **Return only these deltas** (and any minimal metadata needed) from the Worker, not the entire sheet.
3. **Implement the corresponding Applier on the Main Thread:** a function that takes the current sheet (or state) and the array of deltas and **patches** the local state by applying each delta (e.g. update cell at `[row, col]` with the new data). The Main Thread hook receives the deltas, calls the Applier, and updates the Provider state with the patched result.

## Contract

- **Worker:** Returns something like `{ deltas: Array<{ rowIndex, cellKey?, value?, error?, ... }> }` (or equivalent with `[row, col]` and payload), not `{ sheet: Sheet }`.
- **Main Thread:** An **Applier** (e.g. `applyDeltas(sheet, deltas)`) produces a new sheet with only the deltas applied; then update state with that result (using structural sharing as per the Strict Immutable Patching skill).

## Verification

- [ ] Worker returns **deltas** (array of changes with coordinates + new data), not the full Sheet.
- [ ] Main Thread has an **Applier** that applies those deltas to the current sheet.
- [ ] The hook that talks to the Worker uses the Applier output to update the Provider state (and follows immutable patching).
