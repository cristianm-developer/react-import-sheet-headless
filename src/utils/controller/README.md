# Controllers: validators, sanitizers, transforms

Controllers are building blocks grouped by **field/context** (e.g. `required`, `string`), not by type. Each context folder holds all sanitizers, validators, and transforms for that domain at every level.

For folder structure and pipeline flow, see [Architecture](../../../.cursor/docs/Architecture.md).

## Execution order

**Cell → row → sheet (table).**

- Sanitizer, Validator, and Transform runners execute in this order: first all cell-level, then row-level, then one table-level pass at the end.
- Cell and row steps are **synchronous**; only **table**-level steps may be **async** (e.g. backend checks).

## Naming and layout

- **File naming:** `{level}-{context}-{type}.ts` — e.g. `cell-email-sanitizer.ts`, `row-email-validator.ts`, `table-email-transform.ts`. Levels: `cell`, `row`, `table`.
- **Layout:** The layout references controllers by **string id** (e.g. `validators: ['required', 'email']` or `{ name: 'in-list', params: { list: [...] } }`). The Provider maintains three **Registry** instances (validator, sanitizer, transform); Workers resolve by id from their own registry (same ESM modules or serialized functions).

## How to implement a controller

1. Create a folder under `controller/` for the context (e.g. `email/`, `phone/`).
2. Add files following `{level}-{context}-{type}.ts` and export the function and a **Register()** helper that returns the string id and optionally registers with the Provider’s register API.
3. Export from the controller barrel so the Worker can import and the Runner can resolve by id. All configuration must go via **params** in the layout (no closures) so code is Worker-safe.

## Controllers in this repo

| Context      | Contents                                                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **required** | [cell-required-validator](required/cell-required-validator.ts) — `required` (cell).                                                                                                                                                                                                                                                    |
| **string**   | Sanitizers: trim, string:maxLength, nullToEmpty, pad, collapse-spaces, lower/upper. Validators: string:byregex, string:maxLength, string:minLength, string:email, string:phone, string:onlyNumbers, string:onlyLetters. Transforms: toUpperCase, toLowerCase, slice, replace, replaceByRegex, fillStart, fillEnd, extractByRegex.      |
| **number**   | Sanitizers: number (int), float, number:toStringId, number:toStringEnd. Validators: number:min, number:max, number:float, number:integer, number:nonNegative, number:nonPositive, number:nonZero. Transforms: numberAdd, numberMultiply, numberDivide, numberSubtract, numberRound, numberAbs, numberSqrt, numberLimit, numberPercent. |
| **date**     | Sanitizers: data:year, data:data, data:time, data:timestamp, data:format. Validators: date:min, date:max, date:onlyYear, date:onlyTime, date:datetime, date:timestamp, date:utc. Transforms: dateToOnlyTime, dateToOnlyDate, dateToTimeDate, dateToUtc, dateLimit, dateAdd, dateSubtract.                                              |
| **bool**     | Validators: bool:onlyTrue, bool:onlyFalse.                                                                                                                                                                                                                                                                                             |
| **replace**  | Sanitizers: replace-from-regex, replace-from-str.                                                                                                                                                                                                                                                                                      |

See [docs/sanitizers.md](../../../docs/sanitizers.md) and [docs/transformers.md](../../../docs/transformers.md) for full compatibility tables and params.

← [Back to README](../../../README.md) · [Architecture](../../../.cursor/docs/Architecture.md)
