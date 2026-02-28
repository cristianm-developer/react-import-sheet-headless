# Examples

Illustrative **documentation** for `@cristianm/react-import-sheet-headless`. No runnable app — each example is a Markdown document you can read and copy from.

## By topic

| Example                                    | Description                                                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **[layout.md](layout.md)**                 | Define **SheetLayout** and per-field `valueType`, `sanitizers`, `validators`, `transformations` (by id).                            |
| **[sanitizers.md](sanitizers.md)**         | Sanitizers: normal (e.g. trim) and custom (e.g. collapseSpaces), signatures and registration.                                       |
| **[validators.md](validators.md)**         | Validators: normal (e.g. required) and custom (e.g. minLength with params), error shape and registration.                           |
| **[transforms.md](transforms.md)**         | Transforms: normal (e.g. toUpperCase) and custom (e.g. capitalize), signatures and registration.                                    |
| **[implementation.md](implementation.md)** | Component integration: `ImporterProvider`, `useImporter`, register controllers in `useEffect`, `useImporterStatus`, `useSheetData`. |
| **[progress.md](progress.md)**             | Showing progress: `useImporterStatus`, `useImporterEventTarget` / `useImporterProgressSubscription`, phase and percent UI.          |

## Legacy

**[ImportExample.md](ImportExample.md)** — Single document that links to the above parts; use it as a quick index. For full pipeline steps (e.g. `startFullImport`, `convert`), see [how-to.md](../docs/how-to.md).
