# Example: Layout and fields

Illustrative example of how to define a **SheetLayout** and declare fields so the pipeline knows column types and which controllers (sanitizers, validators, transforms) apply to each.

---

## Layout and fields

The **SheetLayout** describes your columns and which controller **ids** apply. You pass it to `useImporter({ layout })` or to the Provider.

- **`name`** and **`version`**: identify the schema (useful for persistence and migrations).
- **`fields`**: an object keyed by **field key** (e.g. the column id). Each field can have:
  - **`valueType`**: `'string' | 'number' | 'bool' | 'date'` — the library casts raw values to this type before sanitizers run.
  - **`sanitizers`**: list of sanitizer **ids** (strings or `{ name: 'id', params?: {...} }`).
  - **`validators`**: list of validator ids (same shape).
  - **`transformations`**: list of transform ids (same shape).

In the layout you only reference **ids**. The actual functions are registered separately with `registerSanitizer`, `registerValidator`, and `registerTransform` (see [sanitizers](sanitizers.md), [validators](validators.md), [transforms](transforms.md)).

```ts
import type { SheetLayout } from '@cristianm/react-import-sheet-headless';

const LAYOUT: SheetLayout = {
  name: 'example-import',
  version: '1',
  fields: {
    name: {
      name: 'name',
      valueType: 'string',
      sanitizers: ['trim', 'collapseSpaces'],
      validators: ['required', { name: 'minLength', params: { min: 2 } }],
      transformations: ['toUpperCase', 'capitalize'],
    },
    email: {
      name: 'email',
      valueType: 'string',
      sanitizers: ['trim'],
      validators: ['required'],
      transformations: ['toUpperCase'],
    },
    amount: {
      name: 'amount',
      valueType: 'number',
      sanitizers: ['trim'],
      validators: ['required'],
    },
  },
};
```

---

## Summary

| What          | How                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Layout**    | Pass to `useImporter({ layout })` or Provider. Object with `name`, `version`, `fields`.                     |
| **Per field** | `valueType`, `sanitizers`, `validators`, `transformations` — all by **id** (strings or `{ name, params }`). |

See also: [Implementation](implementation.md), [How to: Convert](../docs/how-to-convert.md).
