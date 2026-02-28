# How to: Edit (cell-level)

After the pipeline has produced a **result** (validated and transformed sheet), you can **edit individual cells**. Each edit runs a scoped validation and transform pipeline (that cell, that row, and optionally the whole sheet) in a **Web Worker** and updates the provider’s result.

## Flow position

**Parser → Convert → Sanitizer → Validator → Transform → (optional) Edit**

Edit operates on the **result** sheet. It does not re-run the full import; it only re-validates and re-transforms in the scope affected by the change.

## Hook: useSheetEditor

Use **`useSheetEditor(options?)`** inside **ImporterProvider** to get the result sheet, paginated data, and an **`editCell`** function.

```tsx
const { sheet, editCell, removeRow, pageData, totalPages, isReady, changeLog, changeLogAsText } =
  useSheetEditor({
    page: 1,
    pageSize: 25,
    debounceMs: 300,
  });
```

| Option           | Description                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`page`**       | 1-based page index (default `1`).                                                                                        |
| **`pageSize`**   | Rows per page (default `25`).                                                                                            |
| **`debounceMs`** | If set, `editCell` debounces by this many ms before calling the Worker (avoids running the pipeline on every keystroke). |

**Returns:**

- **`sheet`** — The current result (validated + transformed) or `null` before import finishes.
- **`editCell(params)`** — Call with `{ rowIndex, cellKey, value }` to apply an edit. Without `debounceMs`, returns `Promise<void>`; with debounce, the call is queued and returns immediately.
- **`removeRow(rowIndex)`** — Call with the **global** row index (0-based) to remove that row from the sheet. Remaining rows are re-indexed so `row.index` matches array position. No Worker is used; the update is applied synchronously.
- **`pageData`** — `{ page, pageSize, totalCount, totalPages, rows }` derived from `sheet` and your `page`/`pageSize`. **`rows`** are the same object references as in `sheet.rows` for that slice (structural sharing for React.memo).
- **`totalPages`** — Derived from `totalCount` and `pageSize`.
- **`isReady`** — Whether the edit Worker is ready.
- **`changeLog`** — Read-only array of **ChangeLogEntry** (cell edits and row removals) applied during this session. Cleared when **processFile** is called again.
- **`changeLogAsText`** — Human-readable string describing the same changes (e.g. `"Row 1, cell \"email\": set to \"a@b.com\"\nRow 2: removed"`). Useful for display or export. Updated in parallel with edits (non-blocking).

## Edit contract: rowIndex and cellKey

- **`rowIndex`** is the **global** row index in the sheet (e.g. `row.index`), **not** the index within the current page. When you render `pageData.rows`, use each row’s **`row.index`** when calling **`editCell({ rowIndex: row.index, cellKey, value })`**.
- **`cellKey`** must match a field key in your **SheetLayout** (e.g. `'email'`, `'name'`).

Example:

```tsx
// Paginated table: always use row.index (global)
pageData.rows.map((row) => (
  <tr key={row.index}>
    {row.cells.map((cell) => (
      <td key={cell.key}>
        <input
          value={String(cell.value)}
          onChange={(e) =>
            editCell({
              rowIndex: row.index,
              cellKey: cell.key,
              value: e.target.value,
            })
          }
        />
      </td>
    ))}
  </tr>
));
```

## Pipeline on edit

When you call **`editCell({ rowIndex, cellKey, value })`**:

1. The **value** is set on that cell (cell and row errors for that row are cleared before re-validation).
2. **Cell validators** for that field run for that cell only → cell errors updated.
3. **Row validators** run for that row only → row errors updated.
4. **Sheet (table) validators** run on the full sheet → sheet errors updated.
5. If there are **no errors** at sheet/row/cell level: **cell transforms** (that cell), **row transforms** (that row), **sheet transforms** (full sheet) run in order; otherwise transforms are skipped (same safe-first rules as the main Transform step).

All of this runs in a **Web Worker** so the UI stays responsive even with heavy sheet validators (e.g. duplicate check on many rows).

## Structural immutability

Only the **edited row** and the **sheet** reference change; other rows keep the same reference. That allows **React.memo** on row components to avoid re-renders for rows that did not change.

## Removing a row

Call **`removeRow(rowIndex)`** with the **global** row index (same as `row.index`). The row is removed from the sheet and remaining rows are re-indexed (so indices stay 0, 1, 2, …). Use the same **row.index** from your table when rendering a “Delete row” button.

```tsx
<button type="button" onClick={() => removeRow(row.index)} aria-label="Remove row">
  Remove
</button>
```

## Change log (what the user fixed)

The library keeps a **change log** of edits and row removals so you can show or export a summary of what the user did to fix the document.

- **`changeLog`** — Array of **ChangeLogEntry**: `{ type: 'cell_edit', rowIndex, cellKey, value, previousValue?, timestamp }` or `{ type: 'row_remove', rowIndex, timestamp }`. Row numbers in the log are **1-based** for display.
- **`changeLogAsText`** — String built from **`formatChangeLogAsText(changeLog)`** (exported from the package). Example: `"Row 1, cell \"email\": set to \"a@b.com\"\nRow 2: removed"`.

The log is updated **in parallel** with each edit or remove (via a microtask), so it does not block the UI. It is cleared when the user starts a new import (**processFile**).

## Debounce and submit on blur

- **`debounceMs`**: set in options to avoid sending an edit on every keystroke (e.g. `300`).
- **Submit on blur**: do not set `debounceMs`; call **`editCell`** from your input’s **`onBlur`** so the pipeline runs once when the user leaves the field.

## See also

- [How to: Validators](how-to-validators.md) — Same validators run in scoped form on edit.
- [How to: Transformers](how-to-transformers.md) — Same transforms run in scoped form on edit.
- [How to (general)](how-to.md) — Setup, flow, and hooks table.
