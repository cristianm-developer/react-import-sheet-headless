# Migration Guide: v1.0.2 → v1.0.3

**Date:** 2026-03-04  
**Breaking Changes:** None  
**Bug Fixes:** Critical orchestration bug fixed  
**Action Required:** Update dependency and simplify code

---

## What Changed

### Bug Fix: Automatic Orchestration

**Issue in v1.0.2:** The library would get stuck in "loading" state after calling `processFile()` unless the consumer also called `useImportSheet()` in their component.

**Fixed in v1.0.3:** The Provider now automatically handles orchestration. Calling `processFile()` will now trigger the parser and progress through the pipeline as expected.

---

## Migration Steps

### 1. Update Dependency

```bash
npm install @cristianmpx/react-import-sheet-headless@^1.0.3
```

### 2. Simplify Your Code (Optional)

If you were calling `useImportSheet()` only to make the library work (not because you needed `startFullImport()`), you can now remove it:

#### Before (v1.0.2 - workaround)

```tsx
import {
  ImporterProvider,
  useImporter,
  useImportSheet, // ← Required as workaround
  useImporterStatus,
  useSheetData,
} from '@cristianmpx/react-import-sheet-headless';

function MyComponent() {
  const { processFile } = useImporter({ layout });
  const { startFullImport } = useImportSheet(); // ← Had to call this
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return <input type="file" onChange={(e) => processFile(e.target.files[0])} />;
}
```

#### After (v1.0.3 - simplified)

```tsx
import {
  ImporterProvider,
  useImporter,
  // useImportSheet,  ← No longer needed (unless you use startFullImport)
  useImporterStatus,
  useSheetData,
} from '@cristianmpx/react-import-sheet-headless';

function MyComponent() {
  const { processFile } = useImporter({ layout });
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  return <input type="file" onChange={(e) => processFile(e.target.files[0])} />;
}
```

### 3. When to Keep `useImportSheet()`

**Keep it** if you're using the two-phase flow:

1. Preview (first 10 rows) → show to user
2. User confirms → call `startFullImport()` to parse the entire file

```tsx
function MyComponent() {
  const { processFile } = useImporter({ layout });
  const { startFullImport } = useImportSheet(); // ← Keep if using startFullImport()
  const { status } = useImporterStatus();
  const { sheet } = useSheetData();

  const handleFileSelect = (file: File) => {
    processFile(file); // Preview (first 10 rows)
  };

  const handleConfirm = () => {
    startFullImport(); // Parse entire file
  };

  return (
    <>
      <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
      {status === 'success' && <button onClick={handleConfirm}>Import full file</button>}
    </>
  );
}
```

---

## What You Get

### Before (v1.0.2)

- ❌ Library stuck in "loading" state
- ❌ Had to call `useImportSheet()` as a workaround
- ❌ Non-obvious requirement
- ❌ Poor developer experience

### After (v1.0.3)

- ✅ Library works automatically
- ✅ Simpler code (fewer hooks needed)
- ✅ Obvious, intuitive API
- ✅ Better developer experience

---

## Testing Your Update

After updating to v1.0.3, test your import flow:

1. Select a file
2. Verify status progresses: `idle` → `loading` → `success`
3. Verify `rawData` is populated
4. Verify `sheet` is available after conversion/validation

If you were experiencing the "stuck in loading" bug, it should now be resolved.

---

## Backward Compatibility

This change is **100% backward compatible**:

- If you're already calling `useImportSheet()`, it will continue to work
- If you weren't calling it (and experiencing the bug), it will now work automatically
- No breaking changes to any API, types, or behavior

---

## Need Help?

If you encounter any issues after updating:

1. Check that your bundler configuration is correct (see `ai-context.md` § 1.2)
2. Verify you're calling `processFile()` with a valid `File` object
3. Check the browser console for any errors
4. Open an issue with reproduction steps

---

## Summary

**TL;DR:** Update to v1.0.3 and the library will work automatically. You can remove `useImportSheet()` if you're not using `startFullImport()`.
