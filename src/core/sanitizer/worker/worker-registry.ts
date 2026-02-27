import { Registry } from '../../../shared/registry/index.js';
import { registerTrimSanitizer } from '../../../utils/controller/string/cell-trim-sanitizer.js';
import type { ConvertedSheet, ConvertedSheetCell, ConvertedSheetRow } from '../../convert/types/converted-sheet.js';

type CellSanitizerFn = (
  cell: ConvertedSheetCell,
  row: ConvertedSheetRow,
  p?: Readonly<Record<string, unknown>>,
) => ConvertedSheetCell;

type RowSanitizerFn = (
  row: ConvertedSheetRow,
  p?: Readonly<Record<string, unknown>>,
) => ConvertedSheetRow | null;

type SheetSanitizerFn = (sheet: ConvertedSheet, p?: Readonly<Record<string, unknown>>) => ConvertedSheet;

const registry = new Registry<(...args: unknown[]) => unknown>();

registerTrimSanitizer((name, fn, opts) => {
  registry.register(name, fn, opts);
});

function getCellSanitizer(name: string): CellSanitizerFn | undefined {
  const entry = registry.get(name);
  if (!entry || entry.type !== 'cell') return undefined;
  return entry.fn as CellSanitizerFn;
}

function getRowSanitizer(_name: string): RowSanitizerFn | undefined {
  return undefined;
}

function getSheetSanitizer(_name: string): SheetSanitizerFn | undefined {
  return undefined;
}

export function getSanitizerGetters(): {
  getCellSanitizer: (name: string) => CellSanitizerFn | undefined;
  getRowSanitizer: (name: string) => RowSanitizerFn | undefined;
  getSheetSanitizer: (name: string) => SheetSanitizerFn | undefined;
} {
  return { getCellSanitizer, getRowSanitizer, getSheetSanitizer };
}
