import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_MIN_LENGTH_VALIDATOR_ID = 'string:minLength';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { minLength?: number };

export function cellStringMinLengthValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { minLength } = (params ?? {}) as Params;
  const min =
    typeof minLength === 'number' && Number.isFinite(minLength) && minLength >= 0
      ? minLength
      : undefined;
  if (min === undefined) {
    return [{ code: 'STRING_MIN_LENGTH_INVALID_PARAMS', level: 'error', params: { minLength } }];
  }
  const s = value === null || value === undefined ? '' : String(value);
  if (s.length < min) {
    return [
      {
        code: 'STRING_MIN_LENGTH',
        level: 'error',
        params: { value: s, minLength: min, length: s.length },
      },
    ];
  }
  return null;
}

export function registerStringMinLengthValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_MIN_LENGTH_VALIDATOR_ID, cellStringMinLengthValidator, { type: 'cell' });
}

export const CellStringMinLengthValidator = {
  id: STRING_MIN_LENGTH_VALIDATOR_ID,
  validate: cellStringMinLengthValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringMinLengthValidator(registerFn);
    return STRING_MIN_LENGTH_VALIDATOR_ID;
  },
};
