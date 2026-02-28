← [Back to README](../README.md)

# Transformers reference

Compatibility table and where to configure transforms in the layout. For usage, flow, and Register(): [How to: Transformers](how-to-transformers.md).

## Compatibility table

### String (cell)

| Id               | Params                               | Description                                                 |
| ---------------- | ------------------------------------ | ----------------------------------------------------------- |
| `toUpperCase`    | —                                    | String to uppercase                                         |
| `toLowerCase`    | —                                    | String to lowercase                                         |
| `slice`          | `start?`, `end?`                     | String slice                                                |
| `replace`        | `search?`, `replacement?`            | Replace search string with replacement                      |
| `replaceByRegex` | `pattern?`, `flags?`, `replacement?` | Replace by regex                                            |
| `fillStart`      | `length?`, `fill?`                   | Pad start to length (default fill `' '`)                    |
| `fillEnd`        | `length?`, `fill?`                   | Pad end to length                                           |
| `extractByRegex` | `pattern?`, `flags?`, `group?`       | Extract first match or capture group (group 0 = full match) |

### Number (cell)

| Id               | Params                                      | Description                                     |
| ---------------- | ------------------------------------------- | ----------------------------------------------- |
| `numberAdd`      | `value?`                                    | Add number to value                             |
| `numberMultiply` | `value?`                                    | Multiply by value                               |
| `numberDivide`   | `value?`                                    | Divide by value (ignored if 0)                  |
| `numberSubtract` | `value?`                                    | Subtract value                                  |
| `numberRound`    | `mode?`: `'round'` \| `'ceil'` \| `'floor'` | Round number                                    |
| `numberAbs`      | —                                           | Absolute value                                  |
| `numberSqrt`     | —                                           | Square root (non-numeric or negative unchanged) |
| `numberLimit`    | `min?`, `max?`                              | Clamp to min/max                                |
| `numberPercent`  | `total?`                                    | (value / total) × 100                           |

### Date (cell)

| Id               | Params                                                                | Description                           |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------- |
| `dateToOnlyTime` | —                                                                     | Output time only `HH:mm:ss`           |
| `dateToOnlyDate` | —                                                                     | Output date only `YYYY-MM-DD`         |
| `dateToTimeDate` | —                                                                     | Output datetime `YYYY-MM-DDTHH:mm:ss` |
| `dateToUtc`      | —                                                                     | Output ISO UTC string                 |
| `dateLimit`      | `min?`, `max?` (ISO string or timestamp)                              | Clamp date to range                   |
| `dateAdd`        | `days?`, `hours?`, `minutes?`, `seconds?`, `ms?`, `months?`, `years?` | Add time; output ISO string           |
| `dateSubtract`   | Same as `dateAdd`                                                     | Subtract time; output ISO string      |

Layout fields: **`fields[].transformations`** (cell), **`rowTransformations`** (row), **`sheetTransformations`** (sheet). Each entry is a string id or `{ name: 'id', params?: {...} }`. Sheet-level transforms may be async.

## See also

- [How to: Transformers](how-to-transformers.md) — Flow, safe-first, delta, Register(), sync vs async.
- [README](../README.md) — Quick Start and Schema Docs overview.
