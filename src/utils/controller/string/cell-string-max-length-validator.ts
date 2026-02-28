import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_MAX_LENGTH_VALIDATOR_ID = 'string:maxLength';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { maxLength?: number };

export function cellStringMaxLengthValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { maxLength } = (params ?? {}) as Params;
  const max = typeof maxLength === 'number' && Number.isFinite(maxLength) ? maxLength : undefined;
  if (max === undefined || max < 0) {
    return [{ code: 'STRING_MAX_LENGTH_INVALID_PARAMS', level: 'error', params: { maxLength } }];
  }
  const s = value === null || value === undefined ? '' : String(value);
  if (s.length > max) {
    return [
      {
        code: 'STRING_MAX_LENGTH',
        level: 'error',
        params: { value: s, maxLength: max, length: s.length },
      },
    ];
  }
  return null;
}

export function registerStringMaxLengthValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_MAX_LENGTH_VALIDATOR_ID, cellStringMaxLengthValidator, { type: 'cell' });
}

export const CellStringMaxLengthValidator = {
  id: STRING_MAX_LENGTH_VALIDATOR_ID,
  validate: cellStringMaxLengthValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringMaxLengthValidator(registerFn);
    return STRING_MAX_LENGTH_VALIDATOR_ID;
  },
};
