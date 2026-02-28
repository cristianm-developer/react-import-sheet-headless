# Example: Validators

Illustrative example of **validators**: they check validity and return **errors** (or `null` if valid). They run after sanitizers. They must **not** mutate data.

---

## Normal and custom validators

- **Normal (e.g. required):** value must be non-empty (not null, undefined, or blank string).
- **Custom (e.g. minLength):** value length must be at least `params.min` (params come from the layout: `{ name: 'minLength', params: { min: 2 } }`).

Both are **cell-level** validators: they receive `(value, row, params?)` and return `readonly SheetError[] | null`. Errors use **codes** and **params** so the UI can translate them (I18n). Register with `registerValidator(id, fn, { type: 'cell' })`.

```ts
import type { SheetError } from '@cristianm/react-import-sheet-headless';

function required(
  value: unknown,
  _row: unknown,
  _params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const empty = value == null || (typeof value === 'string' && (value as string).trim() === '');
  return empty ? [{ code: 'REQUIRED', level: 'error', params: { value } }] : null;
}

function minLength(
  value: unknown,
  _row: unknown,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const min = (params?.min as number) ?? 0;
  const s = value == null ? '' : String(value);
  if (s.length < min) {
    return [{ code: 'MIN_LENGTH', level: 'error', params: { min, actual: s.length } }];
  }
  return null;
}

// Register so the layout can use 'required' and { name: 'minLength', params: { min: 2 } }.
// registerValidator('required', required, { type: 'cell' });
// registerValidator('minLength', minLength, { type: 'cell' });
```

---

## Summary

| What           | How                                                              |
| -------------- | ---------------------------------------------------------------- | ----- | ---------------------------------- |
| **Validators** | Register with `registerValidator(id, fn, { type: 'cell'          | 'row' | 'table' })`. Layout references id. |
| **Return**     | `SheetError[]` or `null`. Use **codes** and **params** for I18n. |

See: [Layout](layout.md), [Implementation](implementation.md), [How to: Validators](../docs/how-to-validators.md).
