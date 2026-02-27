import { Registry } from '../../../shared/registry/index.js';
import { registerRequiredValidator } from '../../../utils/controller/required/cell-required-validator.js';
import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheet, SanitizedSheetRow } from '../../sanitizer/types/sanitized-sheet.js';

type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  p?: Readonly<Record<string, unknown>>,
) => readonly SheetError[] | null;

type RowValidatorFn = (
  row: SanitizedSheetRow,
  p?: Readonly<Record<string, unknown>>,
) => readonly SheetError[] | null;

type TableValidatorFn = (
  sheet: SanitizedSheet,
  p?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal,
) => readonly SheetError[] | null | Promise<readonly SheetError[] | null>;

const registry = new Registry<(...args: unknown[]) => unknown>();

registerRequiredValidator((name, fn, opts) => {
  registry.register(name, fn, opts);
});

function getCellValidator(name: string): CellValidatorFn | undefined {
  const entry = registry.get(name);
  if (!entry || entry.type !== 'cell') return undefined;
  return entry.fn as CellValidatorFn;
}

function getRowValidator(_name: string): RowValidatorFn | undefined {
  return undefined;
}

function getTableValidator(_name: string): TableValidatorFn | undefined {
  return undefined;
}

export function getValidatorGetters(): {
  getCellValidator: (name: string) => CellValidatorFn | undefined;
  getRowValidator: (name: string) => RowValidatorFn | undefined;
  getTableValidator: (name: string) => TableValidatorFn | undefined;
} {
  return { getCellValidator, getRowValidator, getTableValidator };
}
