← [Back to README](../README.md)

# Sanitizers reference

Compatibility table and where to configure sanitizers in the layout. For usage, flow, and registration: [How to: Sanitizer](how-to-sanitizer.md).

## Compatibility table

| Sanitizer | Level | Params | Example |
|-----------|-------|--------|---------|
| `trim` | Cell | — | `sanitizers: ['trim']` or register with `registerTrimSanitizer(registerSanitizer)` then use `'trim'` in layout |

Layout fields: **`fields[].sanitizers`** (cell), **`rowSanitizers`** (row), **`sheetSanitizers`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Sanitizers are resolved by id from the registry (built-in or registered via **`registerSanitizer`**).

## See also

- [How to: Sanitizer](how-to-sanitizer.md) — Flow, layout, value type, adding your own vs built-in, Register helpers.
- [README](../README.md) — Quick Start and Schema Docs overview.
