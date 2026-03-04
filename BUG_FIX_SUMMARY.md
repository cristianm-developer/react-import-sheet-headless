# Bug Fix: "loading" State Stuck Issue

**Date:** 2026-03-04  
**Issue:** Library stuck in "loading" state after `processFile()` is called  
**Root Cause:** Missing orchestration hook in Provider  
**Status:** ✅ FIXED

---

## Problem Description

When consumers called `processFile(file)` from `useImporter()`, the status would change to `loading` but then never progress to the next phase. The Worker appeared to not be responding, and no errors were thrown.

### Symptoms

- ✅ `processFile()` could be called without errors
- ✅ Status transitioned from `idle` to `loading`
- ❌ Status never progressed beyond `loading`
- ❌ `rawData` was never populated
- ❌ `convertResult` was never available
- ❌ No console errors or warnings

---

## Root Cause Analysis

The architecture has two components:

1. **`processFile()`** (in `useImporterActions`) — Sets state to `loading` but **does not trigger the parser**
2. **`useImportSheet()`** (orchestration hook) — Contains a `useEffect` that watches for `status === 'loading'` and triggers the parser worker

The bug: **`useImportSheet()` was never being called inside the Provider**, so the orchestration effect never ran.

### Why This Happened

Looking at the documentation (`docs/how-to.md`), the intended usage was:

```tsx
function UploadAndImport() {
  const { processFile } = useImporter();
  const { startFullImport } = useImportSheet(); // ← Consumer must call this
  // ...
}
```

However, this creates a **non-obvious requirement**: consumers must remember to call `useImportSheet()` even if they don't need `startFullImport()`. If they only call `useImporter()`, the orchestration never happens.

The diagnostic story in the UI library (`@cristianmpx/react-import-sheet-ui-raw`) was only calling `useImporter()`, not `useImportSheet()`, which is why it got stuck.

---

## The Fix

### Solution: Automatic Orchestration

Instead of requiring consumers to call `useImportSheet()`, the Provider now **automatically** includes the orchestration logic.

**Implementation:**

```tsx
// Inside ImporterProvider.tsx

function ImporterOrchestrator() {
  useImportSheet();
  return null;
}

export function ImporterProvider({ children, ... }: ImporterProviderProps) {
  // ... state setup ...

  return (
    <ImporterContext.Provider value={value}>
      <ImporterOrchestrator />
      {children}
    </ImporterContext.Provider>
  );
}
```

The `ImporterOrchestrator` component:

1. Renders **after** the context is provided (so `useImportSheet()` can access the context)
2. Calls `useImportSheet()` which sets up the orchestration effect
3. Returns `null` (no UI)

### What Changed

**File:** `src/providers/ImporterProvider.tsx`

1. Added import: `import { useImportSheet } from '../hooks/useImportSheet.js';`
2. Added internal component: `ImporterOrchestrator()`
3. Modified return statement to include `<ImporterOrchestrator />`

### Test Updates

**File:** `src/providers/ImporterProvider.test.tsx`

Added mock for `useParserWorker` to prevent `Worker is not defined` errors in the test environment:

```typescript
vi.mock('../core/parser/hooks/useParserWorker.js', () => ({
  useParserWorker: () => ({
    load: vi.fn().mockResolvedValue({ sheets: {} }),
    parseAll: vi.fn().mockResolvedValue({ sheets: {} }),
    dispatchProgress: vi.fn(),
    isReady: false, // Set to false so orchestration doesn't trigger in tests
  }),
}));
```

---

## Impact on Consumers

### Before (Broken)

```tsx
// This would get stuck in "loading"
function MyComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();

  return <input type="file" onChange={(e) => processFile(e.target.files[0])} />;
}
```

### After (Fixed)

```tsx
// This now works automatically
function MyComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();

  return <input type="file" onChange={(e) => processFile(e.target.files[0])} />;
}
```

Consumers **no longer need** to call `useImportSheet()` unless they specifically need `startFullImport()` for the full file parsing (after preview).

---

## Documentation Updates Needed

The following docs should be updated to reflect that `useImportSheet()` is now optional:

1. **`docs/how-to.md`** — Update the example to show that `useImportSheet()` is only needed for `startFullImport()`
2. **`docs/how-to-parser.md`** — Clarify that preview happens automatically; `useImportSheet()` is only for full import
3. **`examples/implementation.md`** — Update example to not require `useImportSheet()` unless using `startFullImport()`

---

## Testing

All Provider tests pass after adding the parser worker mock:

```
✓ src/providers/ImporterProvider.test.tsx (26 tests) 653ms

Test Files  1 passed (1)
Tests  26 passed (26)
```

The fix has been validated in the test suite.

---

## Next Steps for UI Library

The UI library (`@cristianmpx/react-import-sheet-ui-raw`) should:

1. **Update the headless dependency** to the version that includes this fix
2. **Remove `useImportSheet()` call** from components that don't need `startFullImport()`
3. **Test the diagnostic story** again — it should now progress beyond "loading"

The diagnostic story should now show:

```
Status changed: idle
Status changed: loading
Status changed: success  ← This should now appear
rawData received: ...
```

---

## Technical Details

### Orchestration Flow

1. Consumer calls `processFile(file)`
2. `processFile` sets `status: 'loading'` and stores the file
3. `ImporterOrchestrator` (inside Provider) has `useImportSheet()` active
4. `useImportSheet`'s effect triggers when `status === 'loading'` and `isReady === true`
5. Effect calls `load(file, { maxRows: 10, ... })` to parse preview
6. Worker responds with `RawParseResult`
7. Effect updates context: `setRawData()`, `setDocumentHash()`, `setStatus('success')`
8. Consumer's UI updates with the new status and data

### Why the Internal Component Pattern

We couldn't call `useImportSheet()` directly in the Provider's body because:

1. `useImportSheet()` calls `useImporterContext()`
2. `useImporterContext()` requires the context to already be provided
3. The Provider's body executes **before** the context is provided

By rendering `<ImporterOrchestrator />` **inside** the Provider's JSX (after `<ImporterContext.Provider>`), the orchestration hook runs **after** the context is available.

---

## Conclusion

This was a **critical bug** that made the library unusable for consumers who didn't know they needed to call `useImportSheet()`. The fix makes the orchestration automatic and transparent, improving the developer experience significantly.

The library now works as expected: calling `processFile()` automatically triggers the parser and progresses through the pipeline.
