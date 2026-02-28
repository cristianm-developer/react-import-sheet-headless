← [Back to README](../README.md)

# Sanitizers reference

Compatibility table and where to configure sanitizers in the layout. For usage, flow, and registration: [How to: Sanitizer](how-to-sanitizer.md).

## Compatibility table

| Sanitizer            | Level | Params                              | Example                               |
| -------------------- | ----- | ----------------------------------- | ------------------------------------- |
| `trim`               | Cell  | —                                   | `sanitizers: ['trim']`                |
| `number`             | Cell  | —                                   | Strips non-digits, outputs integer    |
| `float`              | Cell  | —                                   | Strips non-numeric, outputs float     |
| `number:toStringId`  | Cell  | `length?`, `fill?`                  | Pad numeric at start (e.g. `00042`)   |
| `number:toStringEnd` | Cell  | `length?`, `fill?`                  | Pad numeric at end                    |
| `data`               | Cell  | —                                   | Formatted date+time string (ISO-like) |
| `data:year`          | Cell  | —                                   | Year only (number)                    |
| `data:data`          | Cell  | —                                   | Date only, no time (YYYY-MM-DD)       |
| `data:time`          | Cell  | —                                   | Time only (HH:MM:SS)                  |
| `data:timestamp`     | Cell  | —                                   | Unix timestamp (number)               |
| `string:minusculas`  | Cell  | —                                   | Lowercase                             |
| `string:mayusculas`  | Cell  | —                                   | Uppercase                             |
| `string:maxLength`   | Cell  | `maxLength`                         | Truncate to max length                |
| `string:trimAdd`     | Cell  | `length?`, `fill?`                  | Pad at end                            |
| `string:trimPre`     | Cell  | `length?`, `fill?`                  | Pad at start                          |
| `string:spaces`      | Cell  | —                                   | Collapse multiple spaces to one, trim |
| `nullToEmpty`        | Cell  | —                                   | Convert null/undefined to `''`        |
| `replace-from-regex` | Cell  | `pattern`, `flags?`, `replacement?` | Replace by regex                      |
| `replace-from-str`   | Cell  | `search`, `replacement?`            | Replace literal string                |

Layout fields: **`fields[].sanitizers`** (cell), **`rowSanitizers`** (row), **`sheetSanitizers`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Sanitizers are resolved by id from the registry (built-in or registered via **`registerSanitizer`**).

## See also

- [How to: Sanitizer](how-to-sanitizer.md) — Flow, layout, value type, adding your own vs built-in, Register helpers.
- [README](../README.md) — Quick Start and Schema Docs overview.
