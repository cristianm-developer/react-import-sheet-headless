# How to use react-import-sheet-headless

General setup, flow, and entry points. For topic-specific guides see the links below.

## Setup

Wrap your import flow with **`ImporterProvider`**. Use **`useImporter({ layout?, engine? })`** to pass optional **layout** (SheetLayout) and **engine** (ParserEngine: `'xlsx' | 'csv' | 'auto'`). Both can also be set via the Provider props.

```tsx
import {
  ImporterProvider,
  useImporter,
  useImportSheet,
  useConvert,
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
| **`useConvert()`** | After raw data is set: `convert()` to align headers to layout; returns `convertedSheet` or `convertResult` (reorder/rename/applyMapping). |
| **`useImporterStatus()`** | `status` and progress (subscribe to EventTarget for `importer-progress` / `importer-aborted`). |
| **`useSheetData()`** | Result `sheet` and `errors` for the table. |
| **`useSheetEditor()`** | `editCell` for the edit pipeline (when implemented). |

**Flow:** Call `processFile(file)` → parser runs in a Worker (preview: first 10 rows) → `rawData` and `status` update → call `startFullImport()` to parse the entire file → call **`convert()`** (from `useConvert()`) to align columns to layout → `convertedSheet` or `convertResult` (mapping UI) → run **Sanitizer** on `convertedSheet` to get **`sanitizedSheet`** → run **Validator** on `sanitizedSheet` (Worker returns error delta; main thread applies delta to build **result** sheet with errors); progress and result available via hooks and EventTarget.

## See also

- [How to: Parser and file import](how-to-parser.md) — Supported formats, engine option, preview vs full import, types, progress and abort.
- [How to: Column mapping (Convert)](how-to-convert.md) — Align file headers to layout, reorder/rename columns, applyMapping.
- [How to: Sanitizer](how-to-sanitizer.md) — valueType casting, cell/row/sheet sanitizers, Convert → Sanitizer → Validator.
- [How to: Validators](how-to-validators.md) — cell/row/table validators, delta of errors, Register(), I18n, sync vs async.
- Context-specific guides (e.g. `how-to-layout.md`, `how-to-transformers.md`) are added as those features are documented.
