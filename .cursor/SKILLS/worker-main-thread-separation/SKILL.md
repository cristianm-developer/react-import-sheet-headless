---
name: worker-main-thread-separation
description: Enforces environment awareness when writing Worker vs Main Thread code. Use when editing *.worker.ts files, adding Worker APIs, or implementing Comlink communication so DOM APIs are never used in workers and communication follows Architecture.md.
---

# Worker–Main Thread Separation

## When This Applies

- Editing or creating `*.worker.ts` files
- Adding or changing code that runs inside a Web Worker
- Implementing or changing communication between Main Thread and Worker

## Rules

### 1. Worker code is strictly forbidden from using DOM APIs

In any `*.worker.ts` file you must **not** use:

- `window`
- `document`
- `localStorage` / `sessionStorage`
- Any DOM API (e.g. `getElementById`, `addEventListener` on document)

Doing so causes runtime errors because Workers have no DOM.

### 2. Shared utilities must be environment-agnostic

If a utility is needed in **both** the Worker and the Main Thread:

- Place it in **`src/utils`** (or the project’s shared utils path)
- Ensure it does **not** depend on DOM or Main-Thread-only globals
- Use only primitives, pure functions, and data structures that are safe in both environments

### 3. Communication must use Comlink patterns from Architecture.md

- **Worker:** Expose the API with **`Comlink.expose(api)`** (e.g. in the worker entry file).
- **Main Thread:** Obtain the proxy with **`Comlink.wrap(worker)`** and call methods on the proxy as async functions.
- **Callbacks (e.g. progress):** When the Worker must call back to the Main Thread, pass the callback using **`Comlink.proxy(callback)`** so Comlink serializes it correctly.

Do not implement a custom `postMessage`/`onmessage` protocol; follow the patterns described in `.cursor/docs/Architecture.md` (Web Workers and Comlink section).

## Verification

Before finishing changes to Worker code:

- [ ] No `window`, `document`, or `localStorage` in `*.worker.ts`
- [ ] Shared logic used by the Worker lives in `src/utils` and is environment-agnostic
- [ ] Worker exposes API via `Comlink.expose(api)`; Main uses `Comlink.wrap(worker)` and `Comlink.proxy` for callbacks
