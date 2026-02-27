import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { ExportOptions } from '../types/export-options.js';

const BOM = '\uFEFF';

function escapeCsvValue(value: string, separator: string): string {
  const needsQuotes =
    value.includes(separator) || value.includes('"') || value.includes('\n') || value.includes('\r');
  if (!needsQuotes) return value;
  return '"' + value.replace(/"/g, '""') + '"';
}

function cellValueToString(value: unknown, formatDates: boolean): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return formatDates ? value.toLocaleString() : value.toISOString();
  return String(value);
}

export function sheetToCSV(
  sheet: Sheet,
  sheetLayout: SheetLayout | null,
  options: ExportOptions = {},
): string {
  const {
    includeHeaders = true,
    csvSeparator = ',',
    formatDatesForExport = false,
  } = options;
  const fieldOrder =
    sheetLayout != null ? Object.keys(sheetLayout.fields) : [];
  const effectiveOrder =
    fieldOrder.length > 0
      ? fieldOrder
      : (sheet.rows[0]?.cells.map((c) => c.key) ?? sheet.headers.slice());

  const lines: string[] = [];
  if (includeHeaders && effectiveOrder.length > 0) {
    lines.push(effectiveOrder.map((h) => escapeCsvValue(h, csvSeparator)).join(csvSeparator));
  }
  for (const row of sheet.rows) {
    const values = effectiveOrder.map((key) => {
      const cell = row.cells.find((c) => c.key === key);
      const raw = cell?.value ?? '';
      return escapeCsvValue(cellValueToString(raw, formatDatesForExport), csvSeparator);
    });
    lines.push(values.join(csvSeparator));
  }
  const body = lines.join('\r\n');
  return BOM + body;
}
