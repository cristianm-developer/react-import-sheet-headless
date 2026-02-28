# Example: layout, fields, and controllers (index)

This document is an **index** to the split examples. Each part is in its own file so you can jump to layout, sanitizers, validators, transforms, implementation, or progress.

---

## Split examples

| Part                  | File                                   | Content                                                                                                             |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Layout and fields** | [layout.md](layout.md)                 | `SheetLayout`, `name`, `version`, `fields` (valueType, sanitizers, validators, transformations by id).              |
| **Sanitizers**        | [sanitizers.md](sanitizers.md)         | trim, collapseSpaces; cell-level signature and `registerSanitizer`.                                                 |
| **Validators**        | [validators.md](validators.md)         | required, minLength; `SheetError` shape and `registerValidator`.                                                    |
| **Transforms**        | [transforms.md](transforms.md)         | toUpperCase, capitalize; cell-level signature and `registerTransform`.                                              |
| **Implementation**    | [implementation.md](implementation.md) | `ImporterProvider`, `useImporter`, registration in `useEffect`, `processFile`, `useImporterStatus`, `useSheetData`. |
| **Progress**          | [progress.md](progress.md)             | `useImporterStatus`, `useImporterEventTarget`, `useImporterProgressSubscription`, phase/percent and progress bar.   |

---

## Summary

- **Layout** → pass to `useImporter({ layout })` or Provider; object with `name`, `version`, `fields`.
- **Sanitizers / Validators / Transforms** → register with `registerSanitizer`, `registerValidator`, `registerTransform`; layout references **ids** only. Controllers must be **pure** and **Worker-safe**.
- **Flow** → wrap with `ImporterProvider`, register controllers once, call `processFile(file)`, read status and sheet from hooks. For full pipeline (`startFullImport`, `convert`), see [how-to.md](../docs/how-to.md).

For more: [How to / Usage](../docs/how-to.md), [Validators](../docs/how-to-validators.md), [Sanitizer](../docs/how-to-sanitizer.md), [Transformers](../docs/how-to-transformers.md).
