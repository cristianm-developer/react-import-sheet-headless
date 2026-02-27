import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheet } from '../../sanitizer/types/sanitized-sheet.js';
import type { ValidatorErrorDeltaItem } from '../types/validator-delta.js';
import { resolveValidatorRef } from './resolve-validator-ref.js';

export const EXTERNAL_VALIDATION_FAILED = 'EXTERNAL_VALIDATION_FAILED';

export type TableValidatorFn = (
  sheet: SanitizedSheet,
  params?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal,
) => readonly SheetError[] | null | Promise<readonly SheetError[] | null>;

export type GetTableValidator = (name: string) => TableValidatorFn | undefined;

function toSheetLevelItems(errors: readonly SheetError[]): ValidatorErrorDeltaItem[] {
  return errors.map((error) => ({ error }));
}

export async function runTableValidation(
  sheet: SanitizedSheet,
  sheetLayout: SheetLayout,
  getValidator: GetTableValidator,
  signal?: AbortSignal,
): Promise<ValidatorErrorDeltaItem[]> {
  const list = sheetLayout.sheetValidators;
  if (!list?.length) return [];
  const collected: ValidatorErrorDeltaItem[] = [];
  for (const ref of list) {
    const { name, params } = resolveValidatorRef(ref);
    const fn = getValidator(name);
    if (!fn) continue;
    try {
      const result = await Promise.resolve(fn(sheet, params, signal));
      if (result?.length) collected.push(...toSheetLevelItems(result));
    } catch {
      collected.push({
        error: {
          code: EXTERNAL_VALIDATION_FAILED,
          level: 'fatal',
          params: { reason: 'network' },
        },
      });
    }
  }
  return collected;
}
