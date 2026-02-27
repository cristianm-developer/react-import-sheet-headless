# How to: View — Pagination, filter, export, persist

**useSheetView** exposes everything the UI needs to show and act on the result: paginated data, filter by errors, virtualization API, export (CSV/JSON), and optional session persistence.

## Hook: useSheetView

Use **useSheetView(options?)** inside **ImporterProvider**. It composes **useSheetEditor** and adds view-specific APIs.

```tsx
const view = useSheetView({
  page: 1,
  defaultPageSize: 25,
  filterMode: 'all', // or 'errors-only'
});

// Pagination (1-based)
view.sheet;
view.getPaginatedResult(page?, pageSize?);
view.paginatedRows;
view.page;
view.setPage(page);
view.pageSize;

// Virtualization (e.g. react-window, @tanstack/react-virtual)
view.totalRows;
view.getRows(offset, limit);

// Filter by errors
view.rowsWithErrors;
view.counts; // { totalRows, rowsWithErrors, totalErrors }

// Edit (same as useSheetEditor)
view.editCell({ rowIndex, cellKey, value });

// Export
view.exportToCSV(options?);
view.exportToJSON(options?);
view.downloadCSV(options?);
view.downloadJSON(options?);

// Persist (when ImporterProvider has persist={true})
view.hasRecoverableSession;
view.recoverSession();
view.clearPersistedState();
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **page** | number | 1 | Initial page (1-based). |
| **defaultPageSize** | number | 25 | Page size for pagination. |
| **filterMode** | `'all' \| 'errors-only'` | `'all'` | Show all rows or only rows with `row.errors.length > 0`. |

## Pagination and virtualization

- **getPaginatedResult(page?, pageSize?)** returns `{ page, pageSize, totalCount, totalPages, rows }`. When **filterMode === 'errors-only'**, pagination is over **rowsWithErrors** (memoized).
- **totalRows** is the length of the current view (all rows or rows with errors). Use it with **getRows(offset, limit)** to feed a virtual list (e.g. **@tanstack/react-virtual** or **react-window**) so you never render 50k+ rows at once.

## Export

- **exportToCSV** / **exportToJSON** return a string (CSV includes BOM for Excel UTF-8). Options: **includeHeaders**, **csvSeparator**, **formatDatesForExport**.
- **downloadCSV** / **downloadJSON** create a temporary object URL, trigger download, and call **URL.revokeObjectURL** to avoid memory leaks. Option **filename** (without extension) is supported.

## Persist (IndexedDB)

When **ImporterProvider** is used with **persist={true}** (and optional **persistKey**):

- State (rawData + sheet) is saved to IndexedDB with a **2–3 s debounce** after changes.
- Sessions older than **7 days** are not recoverable (**hasRecoverableSession** is false).
- On load, the app does **not** restore automatically; it exposes **hasRecoverableSession**. Show a prompt (“Continue where you left off?”) and call **recoverSession()** or **clearPersistedState()** as the user chooses.

## See also

- [How to: Edit](how-to-edit.md) — editCell, pageData, structural immutability.
- [How to](how-to.md) — General setup and flow.
