← [Back to README](../README.md)

# Validators reference

Compatibility table and where to configure validators in the layout. For usage, flow, and Register(): [How to: Validators](how-to-validators.md).

## Compatibility table

| Validator | Level | Params | Example |
|-----------|-------|--------|--------|
| `required` | Cell | — | `validators: ['required']` or `CellRequiredValidator.Register(registerValidator)` |

Layout fields: **`fields[].validators`** (cell), **`rowValidators`** (row), **`sheetValidators`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Table-level validators may be async.

## See also

- [How to: Validators](how-to-validators.md) — Flow, layout, I18n, delta, Register(), sync vs async.
- [README](../README.md) — Quick Start and Schema Docs overview.
