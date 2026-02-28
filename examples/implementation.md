# Example: Implementation (component integration)

Illustrative example of **putting it together**: wrap with the Provider, use `useImporter`, register controllers, trigger the pipeline, and read status and result.

---

## Steps

1. **Wrap** your import UI with **`ImporterProvider`**.
2. **Call** **`useImporter({ layout, engine })`** to get `processFile`, `registerValidator`, `registerSanitizer`, `registerTransform`.
3. **Register** all your controller functions **once** (e.g. in `useEffect`) so the layout ids resolve when the pipeline runs.
4. **Trigger** the pipeline by calling **`processFile(file)`** when the user selects a file.
5. **Read** status with **`useImporterStatus()`** and result/errors with **`useSheetData()`**.

For a full run (parse → convert → sanitize → validate → transform), your app may also need to call `startFullImport()` from `useImportSheet()` and `convert()` from `useConvert()` after file selection — see [how-to.md](../docs/how-to.md).

---

## Component example

```tsx
import {
  ImporterProvider,
  useImporter,
  useImporterStatus,
  useSheetData,
} from '@cristianm/react-import-sheet-headless';
import { useCallback, useEffect, useMemo } from 'react';
// LAYOUT: define as in layout.md
// trimCell, collapseSpaces: see sanitizers.md
// required, minLength: see validators.md
// toUpperCase, capitalize: see transforms.md

function ImportExampleInner() {
  const { processFile, registerValidator, registerSanitizer, registerTransform } = useImporter({
    layout: LAYOUT,
    engine: 'auto',
  });

  useEffect(() => {
    registerSanitizer('trim', trimCell, { type: 'cell' });
    registerSanitizer('collapseSpaces', collapseSpaces, { type: 'cell' });
    registerValidator('required', required, { type: 'cell' });
    registerValidator('minLength', minLength, { type: 'cell' });
    registerTransform('toUpperCase', toUpperCase, { type: 'cell' });
    registerTransform('capitalize', capitalize, { type: 'cell' });
  }, [registerSanitizer, registerValidator, registerTransform]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const { status } = useImporterStatus();
  const { sheet, errors } = useSheetData();

  const summary = useMemo(() => {
    if (!sheet) return null;
    return {
      headers: sheet.headers,
      rowCount: sheet.rows.length,
      errorCount: errors?.length ?? 0,
    };
  }, [sheet, errors]);

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.ods"
        onChange={onFileChange}
        aria-label="Select file"
      />
      <p>Status: {status}</p>
      {summary && <pre>{JSON.stringify(summary, null, 2)}</pre>}
    </div>
  );
}

export function ImportExample() {
  return (
    <ImporterProvider>
      <ImportExampleInner />
    </ImporterProvider>
  );
}
```

---

## Summary

| Step     | Hook / API                                                                   |
| -------- | ---------------------------------------------------------------------------- |
| Provider | `ImporterProvider`                                                           |
| Entry    | `useImporter({ layout, engine })` → `processFile`, register APIs             |
| Register | `registerSanitizer`, `registerValidator`, `registerTransform` in `useEffect` |
| Status   | `useImporterStatus()` → `status`                                             |
| Result   | `useSheetData()` → `sheet`, `errors`                                         |

For progress UI (phase, percent, bar), see [Progress](progress.md). For layout and controller definitions, see [Layout](layout.md), [Sanitizers](sanitizers.md), [Validators](validators.md), [Transforms](transforms.md).
