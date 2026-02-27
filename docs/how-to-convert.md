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

## Mismatch: reorder and map columns

When the file has different column names or order, **convert()** sets **convertResult** and **convertedSheet** stays `null`. You can:

1. **Show headers found:** `convertResult.headersFound` (file column names).
2. **Show mismatches:** `convertResult.mismatches` (expected layout field, found header or null, optional message).
3. **Reorder columns:** `convertResult.reorderColumns(fieldNames)` — set the order of layout fields used for conversion and display.
4. **Map file header → layout field:** `convertResult.renameColumn(fileHeader, layoutFieldName)` — e.g. `renameColumn('Col1', 'Email')`.
5. **Re-run conversion:** `convertResult.applyMapping()` — uses current **columnOrder** and **headerToFieldMap** and runs conversion again. If all layout fields are mapped, **convertedSheet** is set; otherwise **convertResult** is updated with new mismatches.

Example: file has `['Col1', 'Col2']`, layout expects `['Email', 'Name']`. Call `renameColumn('Col1', 'Email')`, `renameColumn('Col2', 'Name')`, then `applyMapping()` to get **convertedSheet**.

## Types

- **ConvertedSheet** — Same shape as RawSheet; **headers** are layout field names; each row’s **cells** are keyed by layout field name with values from the mapped file columns.
- **ConvertResult** — `headersFound`, `mismatches` (ColumnMismatch[]), `columnOrder`, `headerToFieldMap`, `reorderColumns`, `renameColumn`, `applyMapping`.
- **ConvertOptions** — Optional `caseSensitive`, `normalizer(header)` for custom header normalization.

## Pipeline position

**Parser → Convert → Sanitizer → Validator → Transform.** Sanitizer (and downstream steps) consume **ConvertedSheet**, not raw parser output.
