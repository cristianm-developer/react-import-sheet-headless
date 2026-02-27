import type { SheetLayoutField } from '../../../types/sheet-layout.js';
import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetCell, SanitizedSheetRow } from '../../sanitizer/types/sanitized-sheet.js';
import { resolveValidatorRef } from './resolve-validator-ref.js';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>,
) => readonly SheetError[] | null;

export type GetCellValidator = (name: string) => CellValidatorFn | undefined;

export function runCellValidators(
  cell: SanitizedSheetCell,
  row: SanitizedSheetRow,
  field: SheetLayoutField,
  getValidator: GetCellValidator,
): readonly SheetError[] {
  const list = field.validators;
  if (!list?.length) return [];
  const errors: SheetError[] = [];
  for (const ref of list) {
    const { name, params } = resolveValidatorRef(ref);
    const fn = getValidator(name);
    if (fn) {
      const result = fn(cell.value, row, params);
      if (result?.length) {
        errors.push(...result);
        const hasFatal = result.some((e) => e.level === 'fatal');
        if (hasFatal) break;
      }
    }
  }
  return errors;
}
