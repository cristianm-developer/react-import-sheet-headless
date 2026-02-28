# How to: Result — Convert sheet to your object shape for submit

After the pipeline finishes, **useSheetData()** exposes the final **sheet** (library type with `rows` and `cells`). To send data to your API or use a specific DTO shape (e.g. `{ nombre, apellido }`), use **toObjects** or **toObjectsWithKeyMap** so you get an array of plain objects ready for submit, or keep using **sheet** for the raw structure.

## Hook: useSheetData

**useSheetData()** returns:

- **sheet** — The final `Sheet` (or `null`). Use it when you want the full structure (rows, cells, errors) without conversion.
- **errors** — Flattened sheet-level errors.
- **toObjects\<T\>(mapRow)** — Converts each row to a value of type `T` via your mapper. Returns `T[]`; returns `[]` when `sheet` is null.
- **toObjectsWithKeyMap(keyMap)** — Converts each row to a plain object by mapping **sheet column keys** to **output attribute names**. Returns `Record<string, unknown>[]`; returns `[]` when `sheet` is null.

## Option 1: Custom mapper (toObjects)

Use **toObjects** when you need full control (rename keys, combine cells, filter, or type the result).

```tsx
import { useSheetData, getCellValue } from '@cristianm/react-import-sheet-headless';

function SubmitStep() {
  const { sheet, toObjects } = useSheetData();

  const users = toObjects((row) => ({
    nombre: getCellValue(row, 'Nombre'),
    apellido: getCellValue(row, 'Apellido'),
  }));

  const handleSubmit = () => {
    if (users.length === 0) return;
    fetch('/api/import', { method: 'POST', body: JSON.stringify(users) });
  };

  return (
    <div>
      {sheet && <p>Rows: {sheet.rows.length}</p>}
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
```

**getCellValue(row, key)** returns the cell value for the given column key, or `undefined` if the key is missing. You can also use `row.cells.find(c => c.key === key)?.value` if you prefer.

## Option 2: Key map (toObjectsWithKeyMap)

Use **toObjectsWithKeyMap** when you only need to rename columns: keys of the object are **sheet column keys**, values are **output attribute names**.

```tsx
const { toObjectsWithKeyMap } = useSheetData();

const users = toObjectsWithKeyMap({
  Nombre: 'nombre',
  Apellido: 'apellido',
  Email: 'email',
});
// users is Record<string, unknown>[] e.g. [{ nombre: '...', apellido: '...', email: '...' }, ...]
```

## Raw sheet (no conversion)

If you do not need a DTO and want the library structure (e.g. to render a table or use **exportToJSON**), use **sheet** from **useSheetData()** or **useSheetView()** as-is. No conversion required.

## See also

- [How to](how-to.md) — General setup and flow.
- [How to: View](how-to-view.md) — exportToJSON, downloadJSON, persist, clearPersistedState after submit.
