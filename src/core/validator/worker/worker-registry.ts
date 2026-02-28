import { Registry } from '../../../shared/registry/index.js';
import { registerRequiredValidator } from '../../../utils/controller/required/cell-required-validator.js';
import { registerStringByregexValidator } from '../../../utils/controller/string/cell-string-byregex-validator.js';
import { registerStringMaxLengthValidator } from '../../../utils/controller/string/cell-string-max-length-validator.js';
import { registerStringMinLengthValidator } from '../../../utils/controller/string/cell-string-min-length-validator.js';
import { registerStringEmailValidator } from '../../../utils/controller/string/cell-string-email-validator.js';
import { registerStringPhoneValidator } from '../../../utils/controller/string/cell-string-phone-validator.js';
import { registerStringPhoneInternationalValidator } from '../../../utils/controller/string/cell-string-phone-international-validator.js';
import { registerStringPhoneLocalValidator } from '../../../utils/controller/string/cell-string-phone-local-validator.js';
import { registerStringOnlyNumbersValidator } from '../../../utils/controller/string/cell-string-only-numbers-validator.js';
import { registerStringOnlyLettersValidator } from '../../../utils/controller/string/cell-string-only-letters-validator.js';
import { registerNumberMinValidator } from '../../../utils/controller/number/cell-number-min-validator.js';
import { registerNumberMaxValidator } from '../../../utils/controller/number/cell-number-max-validator.js';
import { registerNumberFloatValidator } from '../../../utils/controller/number/cell-number-float-validator.js';
import { registerNumberIntegerValidator } from '../../../utils/controller/number/cell-number-integer-validator.js';
import { registerNumberNonNegativeValidator } from '../../../utils/controller/number/cell-number-non-negative-validator.js';
import { registerNumberNonPositiveValidator } from '../../../utils/controller/number/cell-number-non-positive-validator.js';
import { registerNumberNonZeroValidator } from '../../../utils/controller/number/cell-number-non-zero-validator.js';
import { registerDateMinValidator } from '../../../utils/controller/date/cell-date-min-validator.js';
import { registerDateMaxValidator } from '../../../utils/controller/date/cell-date-max-validator.js';
import { registerDateOnlyYearValidator } from '../../../utils/controller/date/cell-date-only-year-validator.js';
import { registerDateOnlyTimeValidator } from '../../../utils/controller/date/cell-date-only-time-validator.js';
import { registerDateDatetimeValidator } from '../../../utils/controller/date/cell-date-datetime-validator.js';
import { registerDateTimestampValidator } from '../../../utils/controller/date/cell-date-timestamp-validator.js';
import { registerDateUtcValidator } from '../../../utils/controller/date/cell-date-utc-validator.js';
import { registerBoolOnlyTrueValidator } from '../../../utils/controller/bool/cell-bool-only-true-validator.js';
import { registerBoolOnlyFalseValidator } from '../../../utils/controller/bool/cell-bool-only-false-validator.js';
import type { SheetError } from '../../../types/error.js';
import type { SanitizedSheet, SanitizedSheetRow } from '../../sanitizer/types/sanitized-sheet.js';

type CellValidatorFn = (
  value: unknown,
  row: SanitizedSheetRow,
  p?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type RowValidatorFn = (
  row: SanitizedSheetRow,
  p?: Readonly<Record<string, unknown>>
) => readonly SheetError[] | null;

type TableValidatorFn = (
  sheet: SanitizedSheet,
  p?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal
) => readonly SheetError[] | null | Promise<readonly SheetError[] | null>;

const registry = new Registry<(...args: unknown[]) => unknown>();

function registerAll(
  register: (name: string, fn: CellValidatorFn, opts: { type: 'cell' }) => void
): void {
  registerRequiredValidator(register);
  registerStringByregexValidator(register);
  registerStringMaxLengthValidator(register);
  registerStringMinLengthValidator(register);
  registerStringEmailValidator(register);
  registerStringPhoneValidator(register);
  registerStringPhoneInternationalValidator(register);
  registerStringPhoneLocalValidator(register);
  registerStringOnlyNumbersValidator(register);
  registerStringOnlyLettersValidator(register);
  registerNumberMinValidator(register);
  registerNumberMaxValidator(register);
  registerNumberFloatValidator(register);
  registerNumberIntegerValidator(register);
  registerNumberNonNegativeValidator(register);
  registerNumberNonPositiveValidator(register);
  registerNumberNonZeroValidator(register);
  registerDateMinValidator(register);
  registerDateMaxValidator(register);
  registerDateOnlyYearValidator(register);
  registerDateOnlyTimeValidator(register);
  registerDateDatetimeValidator(register);
  registerDateTimestampValidator(register);
  registerDateUtcValidator(register);
  registerBoolOnlyTrueValidator(register);
  registerBoolOnlyFalseValidator(register);
}

registerAll((name, fn, opts) => {
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
