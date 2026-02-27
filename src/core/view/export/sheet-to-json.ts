import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { ExportOptions } from '../types/export-options.js';

function cellValueToJson(value: unknown, formatDates: boolean): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return formatDates ? value.toLocaleString() : value.toISOString();
  return value;
}

export function sheetToJSON(
  sheet: Sheet,
  _sheetLayout: SheetLayout | null,
  options: ExportOptions = {},
): string {
  const { formatDatesForExport = false } = options;
  const rows = sheet.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const cell of row.cells) {
      obj[cell.key] = cellValueToJson(cell.value, formatDatesForExport);
    }
    return obj;
  });
  return JSON.stringify(rows, null, 0);
}
