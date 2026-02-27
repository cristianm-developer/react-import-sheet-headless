← [Back to README](../README.md)

# Transformers reference

Compatibility table and where to configure transforms in the layout. For usage, flow, and Register(): [How to: Transformers](how-to-transformers.md).

## Compatibility table

| Transformer | Level | Params | Example |
|-------------|-------|--------|--------|
| `toUpperCase` | Cell | — | `transformations: ['toUpperCase']` or `CellToUpperTransform.Register(registerTransform)` |

Layout fields: **`fields[].transformations`** (cell), **`rowTransformations`** (row), **`sheetTransformations`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Sheet-level transforms may be async.

## See also

- [How to: Transformers](how-to-transformers.md) — Flow, safe-first, delta, Register(), sync vs async.
- [README](../README.md) — Quick Start and Schema Docs overview.
