# Example: Transforms

Illustrative example of **transforms**: they change values (e.g. format, case). They run **after** validation and only where there are **no errors** (safe-first). They do not add validation errors.

---

## Normal and custom transforms

- **Normal (e.g. toUpperCase):** converts string values to uppercase; non-strings unchanged.
- **Custom (e.g. capitalize):** first character uppercase, rest lowercase.

Both are **cell-level** transforms: they receive `(value, cell, row, params?)` and return the new **value**. Register with `registerTransform(id, fn, { type: 'cell' })`.

```ts
function toUpperCase(
  value: unknown,
  _cell: unknown,
  _row: unknown,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  return typeof value === 'string' ? value.toUpperCase() : value;
}

function capitalize(
  value: unknown,
  _cell: unknown,
  _row: unknown,
  _params?: Readonly<Record<string, unknown>>
): unknown {
  if (typeof value !== 'string' || value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// Register so the layout can use 'toUpperCase' and 'capitalize'.
// registerTransform('toUpperCase', toUpperCase, { type: 'cell' });
// registerTransform('capitalize', capitalize, { type: 'cell' });
```

---

## Summary

| What           | How                                                     |
| -------------- | ------------------------------------------------------- | ----- | ---------------------------------- |
| **Transforms** | Register with `registerTransform(id, fn, { type: 'cell' | 'row' | 'table' })`. Layout references id. |
| **When**       | After validation; only on cells/rows with no errors.    |

See: [Layout](layout.md), [Implementation](implementation.md), [How to: Transformers](../docs/how-to-transformers.md).
