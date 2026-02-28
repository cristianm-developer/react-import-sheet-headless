# Example: Sanitizers

Illustrative example of **sanitizers**: they normalize or clean values. They run **after** value-type casting and **before** validators. They do not add errors; they return the (possibly modified) cell/row/sheet.

---

## Normal and custom sanitizers

- **Normal (e.g. trim):** trims whitespace from string values.
- **Custom (e.g. collapseSpaces):** your own logic — e.g. collapse multiple spaces into one.

Both are **cell-level** sanitizers: they receive `(cell, row, params?)` and return a cell `{ key, value }`. Register with `registerSanitizer(id, fn, { type: 'cell' })`. The layout references the **id** (e.g. `'trim'`, `'collapseSpaces'`).

```ts
function trimCell(
  cell: { readonly key: string; readonly value: unknown },
  _row: unknown,
  _params?: Readonly<Record<string, unknown>>
): { key: string; value: unknown } {
  const v = cell.value;
  const s = v == null ? '' : typeof v === 'string' ? v : String(v);
  return { key: cell.key, value: (s as string).trim() };
}

function collapseSpaces(
  cell: { readonly key: string; readonly value: unknown },
  _row: unknown,
  _params?: Readonly<Record<string, unknown>>
): { key: string; value: unknown } {
  const v = cell.value;
  const s = v == null ? '' : typeof v === 'string' ? v : String(v);
  const collapsed = (s as string).replace(/\s+/g, ' ').trim();
  return { key: cell.key, value: collapsed };
}

// Register so the layout can use 'trim' and 'collapseSpaces'.
// registerSanitizer('trim', trimCell, { type: 'cell' });
// registerSanitizer('collapseSpaces', collapseSpaces, { type: 'cell' });
```

---

## Summary

| What           | How                                                                            |
| -------------- | ------------------------------------------------------------------------------ | ----- | ---------------------------------- |
| **Sanitizers** | Register with `registerSanitizer(id, fn, { type: 'cell'                        | 'row' | 'table' })`. Layout references id. |
| **Signature**  | Cell: `(cell, row, params?)` → `{ key, value }`. Must be pure and Worker-safe. |

See: [Layout](layout.md), [Implementation](implementation.md), [How to: Sanitizer](../docs/how-to-sanitizer.md).
