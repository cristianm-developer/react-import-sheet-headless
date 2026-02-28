import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheetRow } from '../../../core/sanitizer/types/sanitized-sheet.js';

export const STRING_BYREGEX_VALIDATOR_ID = 'string:byregex';

export type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type Params = { pattern?: string; flags?: string };

export function cellStringByregexValidator(
  value: unknown,
  _row: SanitizedSheetRow,
  params?: Readonly<Record<string, unknown>>
): readonly SheetError[] | null {
  const { pattern = '', flags = '' } = (params ?? {}) as Params;
  if (!pattern) {
    return [
      {
        code: 'STRING_BYREGEX_INVALID_PARAMS',
        level: 'error',
        params: { reason: 'missing pattern' },
      },
    ];
  }
  const s = value === null || value === undefined ? '' : String(value);
  try {
    const re = new RegExp(pattern, flags);
    if (!re.test(s)) {
      return [{ code: 'STRING_BYREGEX_MISMATCH', level: 'error', params: { value: s, pattern } }];
    }
  } catch {
    return [{ code: 'STRING_BYREGEX_INVALID_PATTERN', level: 'error', params: { pattern } }];
  }
  return null;
}

export function registerStringByregexValidator(
  register: (name: string, fn: CellValidatorFn, options: { type: 'cell' }) => void
): void {
  register(STRING_BYREGEX_VALIDATOR_ID, cellStringByregexValidator, { type: 'cell' });
}

export const CellStringByregexValidator = {
  id: STRING_BYREGEX_VALIDATOR_ID,
  validate: cellStringByregexValidator,
  Register(
    registerFn?: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
  ): string {
    if (registerFn) registerStringByregexValidator(registerFn);
    return STRING_BYREGEX_VALIDATOR_ID;
  },
};
