# @cristianmpx/react-import-sheet-headless

Headless **React** library for **importing** and validating **Excel**/CSV sheet data. No built-in table UI—you bring your own components; the library provides the logic, **Web Worker** speed, and bulk validation.

[![npm version](https://img.shields.io/npm/v/@cristianm/react-import-sheet-headless.svg)](https://www.npmjs.com/package/@cristianm/react-import-sheet-headless) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @cristianmpx/react-import-sheet-headless
```

**Peer dependencies:** React 18+ (`react` and `react-dom`).

## Why Headless

Bring your own components; we provide the logic, Web Worker performance, and bulk validation. No prebuilt `<Table />`—you own the UI and the UX.

## Pipeline

Data flows through a single pipeline. Heavy steps run in Web Workers so the main thread stays responsive.

```mermaid
flowchart LR
  A[Input File] --> B[Parser Worker]
  B --> C[Convert]
  C --> D[Sanitizer Worker]
  D --> E[Validator Worker]
  E --> F[Transform Worker]
  F --> G[Sheet + Errors]
  G -.-> H[Edit optional]
```

**Order:** Input File → Parser (Worker) → Convert (main thread) → Sanitizer (Worker) → Validator (Worker) → Transform (Worker) → Result (sheet) + Errors. Optional: cell-level edit on the result.

## Quick Start

~10 lines to see the value: wrap with the provider, pick a file, read result and errors.

```tsx
import {
  ImporterProvider,
  useImporter,
  useSheetView,
} from '@cristianm/react-import-sheet-headless';

const myLayout = { name: 'my-sheet', version: 1, fields: {} };

function App() {
  return (
    <ImporterProvider>
      <ImporterUI />
    </ImporterProvider>
  );
}

function ImporterUI() {
  const { processFile } = useImporter({ layout: myLayout });
  const { sheet, getPaginatedResult } = useSheetView({ defaultPageSize: 10 });

  if (!sheet) {
    return (
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
    );
  }

  const { rows } = getPaginatedResult(1, 10);
  return (
    <div>
      <p>
        Rows: {sheet.rows.length} | Errors: {sheet.errors.length}
      </p>
      {/* Your table component here, e.g. rows.map(...) */}
    </div>
  );
}
```

For layout, custom validators, and step-by-step usage, see [How to / Usage](docs/how-to.md). For a documented example (layout, fields, sanitizers, validators, transforms) with comments, see [examples/ImportExample.md](examples/ImportExample.md).

### Virtualization (e.g. react-window)

Use `totalRows` and `getRows(page, limit)` (page is 1-based) from `useSheetView()` to feed a virtual list without loading all rows into the DOM:

```tsx
import { FixedSizeList as List } from 'react-window';
import { useSheetView } from '@cristianm/react-import-sheet-headless';

function VirtualizedTable() {
  const { getRows, totalRows } = useSheetView({ filterMode: 'all' });
  const pageSize = 50;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const page = Math.floor(index / pageSize) + 1;
    const offset = index % pageSize;
    const chunk = getRows(page, pageSize);
    const row = chunk[offset];
    return <div style={style}>{row ? `Row ${row.index}: ${JSON.stringify(row.cells)}` : null}</div>;
  };

  return (
    <List height={400} itemCount={totalRows} itemSize={32} width="100%">
      {Row}
    </List>
  );
}
```

**Persistence:** When using `persist={true}`, call **clearPersistedState()** (from **useSheetView**) after the user has successfully submitted the import to your server, so data is not left in IndexedDB indefinitely. See [View / Persist](docs/how-to-view.md).

## How to (usage)

Step-by-step usage and recipes (handling large files, real-time errors, session recovery): **[How to / Usage](docs/how-to.md)**.

Topic-specific guides: [Parser](docs/how-to-parser.md), [Convert](docs/how-to-convert.md), [Sanitizer](docs/how-to-sanitizer.md), [Validators](docs/how-to-validators.md), [Transformers](docs/how-to-transformers.md), [Edit](docs/how-to-edit.md), [View](docs/how-to-view.md), [Result — convert to your object for submit](docs/how-to-result.md).

## Schema Docs

The sheet layout (`SheetLayout`) defines validators, sanitizers, and transformers by level (cell, row, sheet). Options and parameters are documented in:

| Type         | Documentation                                  |
| ------------ | ---------------------------------------------- |
| Validators   | [Validators reference](docs/validators.md)     |
| Sanitizers   | [Sanitizers reference](docs/sanitizers.md)     |
| Transformers | [Transformers reference](docs/transformers.md) |

**By level:**

- **Validators:** cell (per field), row, sheet — see [docs/validators.md](docs/validators.md).
- **Sanitizers:** cell, row, sheet — see [docs/sanitizers.md](docs/sanitizers.md).
- **Transformers:** cell, row, sheet — see [docs/transformers.md](docs/transformers.md).

To add or use controller modules (validators, sanitizers, transforms by context): [Controllers](src/utils/controller/README.md).

## Contributing

- **Conventional Commits:** This project uses [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.). PRs that do not follow this convention may be asked to amend their commit messages.
- **Tests required:** All contributions must pass the test suite. Run `npm run test` before opening a PR. Vitest is used; coverage is maintained. Pre-push hooks may run tests.

## License and links

- **License:** [MIT](https://opensource.org/licenses/MIT)
- **Repository:** (add your repo URL)
- **Documentation:** [docs/](docs/)
