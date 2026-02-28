← [Back to README](../README.md)

# Validators reference

Compatibility table and where to configure validators in the layout. For usage, flow, and Register(): [How to: Validators](how-to-validators.md).

## Compatibility table

| Validator                   | Level | Params                     | Example                                                                  |
| --------------------------- | ----- | -------------------------- | ------------------------------------------------------------------------ |
| `required`                  | Cell  | —                          | `validators: ['required']`                                               |
| `string:byregex`            | Cell  | `pattern`, `flags?`        | `{ name: 'string:byregex', params: { pattern: '^[0-9]+$' } }`            |
| `string:maxLength`          | Cell  | `maxLength`                | `{ name: 'string:maxLength', params: { maxLength: 100 } }`               |
| `string:minLength`          | Cell  | `minLength`                | `{ name: 'string:minLength', params: { minLength: 2 } }`                 |
| `string:email`              | Cell  | —                          | `validators: ['string:email']`                                           |
| `string:phone`              | Cell  | —                          | `validators: ['string:phone']`                                           |
| `string:phoneInternational` | Cell  | —                          | `validators: ['string:phoneInternational']`                              |
| `string:phoneLocal`         | Cell  | `minDigits?`, `maxDigits?` | `{ name: 'string:phoneLocal', params: { minDigits: 6, maxDigits: 10 } }` |
| `string:onlyNumbers`        | Cell  | —                          | `validators: ['string:onlyNumbers']`                                     |
| `string:onlyLetters`        | Cell  | `allowSpaces?`             | `{ name: 'string:onlyLetters', params: { allowSpaces: true } }`          |
| `number:min`                | Cell  | `min`                      | `{ name: 'number:min', params: { min: 0 } }`                             |
| `number:max`                | Cell  | `max`                      | `{ name: 'number:max', params: { max: 999 } }`                           |
| `number:float`              | Cell  | —                          | `validators: ['number:float']`                                           |
| `number:integer`            | Cell  | —                          | `validators: ['number:integer']`                                         |
| `number:nonNegative`        | Cell  | —                          | `validators: ['number:nonNegative']`                                     |
| `number:nonPositive`        | Cell  | —                          | `validators: ['number:nonPositive']`                                     |
| `number:nonZero`            | Cell  | —                          | `validators: ['number:nonZero']`                                         |
| `date:min`                  | Cell  | `min` (ISO or ms)          | `{ name: 'date:min', params: { min: '2024-01-01' } }`                    |
| `date:max`                  | Cell  | `max` (ISO or ms)          | `{ name: 'date:max', params: { max: '2024-12-31' } }`                    |
| `date:onlyYear`             | Cell  | —                          | `validators: ['date:onlyYear']`                                          |
| `date:onlyTime`             | Cell  | —                          | `validators: ['date:onlyTime']`                                          |
| `date:datetime`             | Cell  | —                          | `validators: ['date:datetime']`                                          |
| `date:timestamp`            | Cell  | —                          | `validators: ['date:timestamp']`                                         |
| `date:utc`                  | Cell  | —                          | `validators: ['date:utc']`                                               |
| `bool:onlyTrue`             | Cell  | —                          | `validators: ['bool:onlyTrue']`                                          |
| `bool:onlyFalse`            | Cell  | —                          | `validators: ['bool:onlyFalse']`                                         |

Layout fields: **`fields[].validators`** (cell), **`rowValidators`** (row), **`sheetValidators`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Table-level validators may be async.

## See also

- [How to: Validators](how-to-validators.md) — Flow, layout, I18n, delta, Register(), sync vs async.
- [README](../README.md) — Quick Start and Schema Docs overview.
