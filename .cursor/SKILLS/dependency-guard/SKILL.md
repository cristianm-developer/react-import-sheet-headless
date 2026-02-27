---
name: dependency-guard
description: Advocates for minimal bundle size when building a publishable library. Use before adding any third-party dependency, when choosing between libraries, or when organizing imports so the main bundle stays thin and heavy code lives only in Workers.
---

# Dependency Guard (Bundle Protection)

## When This Applies

- Before adding any **third-party library** to the project
- When implementing features that might require external packages (e.g. xlsx, papaparse, date libs)
- When organizing imports and entry points (main vs worker)

## Rules

### 1. Prefer lightweight or native alternatives

Before adding a dependency to a **logic file** (core, utils, hooks used on main thread):

- Check if the behavior can be implemented with **native JS/TS** or a very **lightweight** alternative.
- Only add a dependency when it is truly necessary (e.g. xlsx for Excel, papaparse for CSV) and there is no small enough substitute.

### 2. Zero-bundle-size-impact for the main thread

If a dependency is **heavy** (e.g. xlsx, papaparse, large parsers or validators):

- It must be imported **only inside the Worker** (e.g. in `*.worker.ts` or modules exclusively used by workers).
- The main bundle must **not** import that dependency; the main thread only uses the Worker API (e.g. via Comlink).
- This keeps the **main bundle thin** for consumers who install the library.

### 3. When a dependency is necessary

- Prefer dependencies that support **tree-shaking** and use **named exports** where possible.
- Document why the dependency is required and that it is confined to the Worker if applicable.

## Verification

- [ ] No heavy third-party lib (xlsx, papaparse, etc.) is imported in main-thread-only code.
- [ ] Heavy deps are only imported inside Worker entry points or Worker-only modules.
- [ ] Lighter alternatives or native JS were considered before adding a new dependency.
