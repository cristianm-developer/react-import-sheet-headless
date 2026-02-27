# How to use react-import-sheet-headless

General setup, flow, and entry points. For topic-specific guides see the links below.

## Setup

Wrap your import flow with **`ImporterProvider`**. Use **`useImporter({ layout?, engine? })`** to pass optional **layout** (SheetLayout) and **engine** (ParserEngine: `'xlsx' | 'csv' | 'auto'`). Both can also be set via the Provider props.

```tsx
import {
  ImporterProvider,
  useImporter,
  useImportSheet,
  useImporterStatus,
  useSheetData,
} from '@cristianm/react-import-sheet-headless';

function App() {
  return (
    <ImporterProvider>
      <UploadAndImport />
    </ImporterProvider>
  );
}

function UploadAndImport() {
  const { processFile, abort } = useImporter({
    layout: myLayoutConfig,
    engine: 'auto',
  });
  const { startFullImport } = useImportSheet();
  const { status } = useImporterStatus();
  const { sheet, errors } = useSheetData();

  const onFileSelect = (file: File) => processFile(file);

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.ods"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      <p>Status: {status}</p>
      {status === 'success' && (
        <>
          <button type="button" onClick={() => startFullImport()}>
            Import full file
          </button>
          {sheet && <pre>{JSON.stringify(sheet.headers)}</pre>}
        </>
      )}
    </div>
  );
}
```

## Hooks and flow

| Hook | Role |
|------|------|
| **`useImporter({ layout?, engine? })`** | Entry: `processFile(file)`, `abort()`, register APIs for validators/sanitizers/transforms. |
| **`useImportSheet()`** | After preview: `startFullImport()` to parse the full file. |
| **`useImporterStatus()`** | `status` and progress (subscribe to EventTarget for `importer-progress` / `importer-aborted`). |
| **`useSheetData()`** | Result `sheet` and `errors` for the table. |
| **`useSheetEditor()`** | `editCell` for the edit pipeline (when implemented). |

**Flow:** Call `processFile(file)` → parser runs in a Worker (preview: first 10 rows) → `rawData` and `status` update → call `startFullImport()` to parse the entire file → progress and result available via hooks and EventTarget.

## See also

- [How to: Parser and file import](how-to-parser.md) — Supported formats, engine option, preview vs full import, types, progress and abort.
- Context-specific guides (e.g. `how-to-validators.md`, `how-to-layout.md`) are added as those features are documented.
