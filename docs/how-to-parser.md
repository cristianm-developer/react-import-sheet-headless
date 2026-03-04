# How to: Parser and file import

Parser behaviour, supported formats, engine option, preview vs full import, and progress/abort.

## Supported formats

- **XLSX, XLS, ODS** — via SheetJS.
- **CSV** — via Papa Parse (encoding and delimiter can be detected; see `parserMeta`).

## Engine option

**`engine`** (ParserEngine: `'xlsx' | 'csv' | 'auto'`) controls which decoder is used. Pass it to **`useImporter({ engine })`** or the Provider’s `engine` prop.

- **`'auto'`** (default when omitted): detection from file extension and MIME.
- **`'xlsx'`** or **`'csv'`**: force that engine (e.g. for misnamed or extensionless files).

## Flow: automatic preview then optional full import

1. **`processFile(file)`** — Sets `status` to `'loading'` and automatically triggers the parser in a Web Worker. The first run is a **preview** (first 10 rows). Result is stored as `rawData` (first sheet) and `documentHash`; `status` becomes `'success'` or `'error'`. **This happens automatically** — you don't need to call any additional hooks.
2. **`startFullImport()`** (optional) — Call this from `useImportSheet()` if you need to parse the entire file after the user confirms the preview. The Worker already has the blob, so no re-upload is needed. Progress is emitted on the importer EventTarget (`importer-progress`). Returns a Promise of **`RawParseResult`**.

**Note:** The preview (step 1) happens automatically when you call `processFile(file)`. You only need `useImportSheet()` if you want to explicitly trigger full file parsing via `startFullImport()`.

## Types

- **`RawParseResult`** — `{ sheets: Record<string, RawSheet>; parserMeta?: { encoding?: string; delimiter?: string } }`. CSV results may include `parserMeta` (encoding/delimiter detected).
- **`RawSheet`** — `name`, `filesize`, `documentHash`, `headers`, `rows` (array of **RawSheetRow** with `index` and `cells`).
- **`RawSheetCellValue`** — `string | number | boolean | Date | null`.

## Progress and abort

- **Progress:** Subscribe via **`useImporterEventTarget()`** or **`useImporterStatus()`** and listen for **`importer-progress`** (e.g. phase, percent, current row, total rows).
- **Abort:** Call **`abort()`** from **`useImporter()`** to terminate the parser Worker and reset; listen for **`importer-aborted`** to update the UI.
