import type { Sheet, ValidatedRow } from '../../../types/sheet.js';

export function getCellValue(row: ValidatedRow, key: string): unknown {
  const cell = row.cells.find((c) => c.key === key);
  return cell?.value;
}

export function sheetRowsToObjects<T>(
  rows: readonly ValidatedRow[],
  mapRow: (row: ValidatedRow) => T
): T[] {
  return rows.map(mapRow);
}

export function sheetToObjectsWithKeyMap(
  sheet: Sheet | null,
  keyMap: Readonly<Record<string, string>>
): Record<string, unknown>[] {
  if (!sheet) return [];
  return sheet.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const [sheetKey, outputKey] of Object.entries(keyMap)) {
      obj[outputKey] = getCellValue(row, sheetKey);
    }
    return obj;
  });
}
