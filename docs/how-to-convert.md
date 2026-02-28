# How to: Column mapping (Convert)

After the parser produces **raw data** (`RawSheet`), the **Convert** step aligns file headers to your **sheet layout**. If headers match (by name, case-insensitive), you get a **ConvertedSheet** ready for the next pipeline step. If they do not match, you get a **ConvertResult** with headers found, mismatches, and APIs to reorder or map columns, then re-run conversion.

## When to run Convert

- **Input:** `rawData` (RawSheet from the parser) and **layout** (SheetLayout from `useImporter({ layout })` or Provider props).
- **When:** After the file is loaded and `rawData` is set (e.g. after preview or after `startFullImport()`). Call **`convert()`** from **`useConvert()`** when you want to align the current `rawData` with the layout.

## useConvert

**`useConvert()`** returns:

- **`convert(options?)`** — Runs conversion with current `rawData` and `layout`. Optional **ConvertOptions** (e.g. `caseSensitive`, custom `normalizer`) control header matching.
- **`convertedSheet`** — When conversion succeeds: the sheet with cells keyed by **layout field names** (ready for Sanitizer). `null` when not yet run or when there is a mismatch.
- **`convertResult`** — When headers do not match the layout: an object with **headersFound**, **mismatches**, **columnOrder**, **headerToFieldMap**, and the correction APIs **reorderColumns**, **renameColumn**, **applyMapping**. `null` when conversion succeeded or not yet run.

## Perfect fit

If every layout field has a matching header in the file (by default: trim + case-insensitive), **convert()** sets **convertedSheet** and **convertResult** stays `null`. Use **convertedSheet** for the next step (e.g. Sanitizer).

## Fuzzy header matching (optional)

By default, Convert matches headers **exactly** (after optional normalizer). You can enable **fuzzy matching** so similar headers are matched (e.g. "Nombre" → "Name", "E-mail" → "Email") using a Levenshtein-based similarity. Pass **`convert({ fuzzyHeaders: true })`**; optionally set **`fuzzyThreshold`** (0–1, default 0.8). Fuzzy is **off by default**. When on, any layout field that did not get an exact match is tried against remaining file headers with similarity ≥ threshold; best matches are assigned greedily. Useful for files with small spelling or naming differences.

## Mismatch: reorder and map columns

When the file has different column names or order, **convert()** sets **convertResult** and **convertedSheet** stays `null`. You can:

1. **Show headers found:** `convertResult.headersFound` (file column names).
2. **Show mismatches:** `convertResult.mismatches` (expected layout field, found header or null, optional message).
3. **Reorder columns:** `convertResult.reorderColumns(fieldNames)` — set the order of layout fields used for conversion and display.
4. **Map file header → layout field:** `convertResult.renameColumn(fileHeader, layoutFieldName)` — e.g. `renameColumn('Col1', 'Email')`.
5. **Re-run conversion:** `convertResult.applyMapping()` — uses current **columnOrder** and **headerToFieldMap** and runs conversion again. If all layout fields are mapped, **convertedSheet** is set; otherwise **convertResult** is updated with new mismatches.

Example: file has `['Col1', 'Col2']`, layout expects `['Email', 'Name']`. Call `renameColumn('Col1', 'Email')`, `renameColumn('Col2', 'Name')`, then `applyMapping()` to get **convertedSheet**.

## Required vs optional columns and extra columns

- **Layout field `required`:** In **SheetLayoutField**, set **`required: false`** for columns that may be missing in the file. When omitted, **`required`** is treated as **true** (column must be present or mappable).
- **Required columns:** All layout fields with **`required !== false`** must be mapped (by name or via **headerToFieldMap**). If any required column is missing, conversion returns **convertResult** with **`layoutError: true`** and **mismatches** listing the missing columns; each **ColumnMismatch** has **`required?: boolean`** so you can show “required column missing” vs “optional column not mapped”.
- **Optional columns:** If only optional columns are missing, conversion **succeeds** and the converted sheet includes those fields with **null** values for unmapped optional columns.
- **Extra document columns:** Columns in the file that do not map to any layout field are **ignored** (not an error). Only layout fields are present in **ConvertedSheet**; extra file columns are not used.
- **Insufficient columns:** If the file has fewer columns than the number of **required** layout fields (e.g. file has 3 columns, layout requires 5), conversion returns **convertResult** with **`layoutError: true`** so the UI can show a clear “layout / format” error.

## Types

- **ConvertedSheet** — Same shape as RawSheet; **headers** are layout field names; each row’s **cells** are keyed by layout field name with values from the mapped file columns. Extra file columns are not included.
- **ConvertResult** — `headersFound`, `mismatches` (ColumnMismatch[]; each has **`required?: boolean`**), `columnOrder`, `headerToFieldMap`, **`layoutError?: boolean`** (true when at least one required column is missing), `reorderColumns`, `renameColumn`, `applyMapping`.
- **ConvertOptions** — Optional `caseSensitive`, `normalizer(header)` for custom header normalization; **`fuzzyHeaders`** (boolean, default **false**) to match similar headers (e.g. "Nombre" → "Name"); **`fuzzyThreshold`** (number, default 0.8 when fuzzy is on) for minimum similarity (0–1).

## Pipeline position

**Parser → Convert → Sanitizer → Validator → Transform.** Sanitizer (and downstream steps) consume **ConvertedSheet**, not raw parser output.
