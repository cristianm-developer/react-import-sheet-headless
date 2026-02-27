# @cristianm/react-import-sheet-headless

Headless React library for importing and validating sheet data (CSV, etc.). No UI—you build the UI; the library provides state, hooks, and pipeline (parse → convert → sanitize → validate → transform).

## Installation

```bash
npm install @cristianm/react-import-sheet-headless
```

Peer dependencies: `react` and `react-dom` (>=18).

## Usage

Wrap your import flow with **ImporterProvider**. Use **useImporter** to pass a layout and get **processFile** and register APIs; **useImporterStatus** for status and progress; **useSheetData** for the result and errors; **useSheetEditor** for **editCell**.

```tsx
import {
  ImporterProvider,
  useImporter,
  useImporterStatus,
  useSheetData,
  useSheetEditor,
} from '@cristianm/react-import-sheet-headless';

const layout = { name: 'my-sheet', version: 1, fields: {} };

function App() {
  return (
    <ImporterProvider>
      <UploadSection />
      <TableSection />
    </ImporterProvider>
  );
}

function UploadSection() {
  const { processFile, registerValidator } = useImporter({ layout });
  const { status } = useImporterStatus();
  const handleFile = (file: File) => processFile(file);
  return <input type="file" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />;
}

function TableSection() {
  const { sheet, errors } = useSheetData();
  const { editCell } = useSheetEditor();
  return (/* render table with sheet, errors; call editCell on edit */);
}
```

Progress is emitted via **EventTarget** (not in React state). Use **useImporterEventTarget** to subscribe to progress for a progress bar. See `.cursor/docs/Architecture.md` and `docs/how-to.md` (when present) for full API and pipeline details.
