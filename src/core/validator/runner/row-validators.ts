import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../sanitizer/types/sanitized-sheet.js';
import { resolveValidatorRef } from './resolve-validator-ref.js';

export type RowValidatorFn = (
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>,
) => readonly SheetError[] | null;

export type GetRowValidator = (name: string) => RowValidatorFn | undefined;

export function runRowValidators(
  row: SanitizedSheetRow,
  sheetLayout: SheetLayout,
  getValidator: GetRowValidator,
): readonly SheetError[] {
  const list = sheetLayout.rowValidators;
  if (!list?.length) return [];
  const errors: SheetError[] = [];
  for (const ref of list) {
    const { name, params } = resolveValidatorRef(ref);
    const fn = getValidator(name);
    if (fn) {
      const result = fn(row, params);
      if (result?.length) {
        errors.push(...result);
        const hasFatal = result.some((e) => e.level === 'fatal');
        if (hasFatal) break;
      }
    }
  }
  return errors;
}
