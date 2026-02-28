import { Registry } from '../../../shared/registry/index.js';
import { registerDateFormatSanitizer } from '../../../utils/controller/date/cell-date-format-sanitizer.js';
import { registerDateOnlySanitizer } from '../../../utils/controller/date/cell-date-only-sanitizer.js';
import { registerDateYearSanitizer } from '../../../utils/controller/date/cell-date-year-sanitizer.js';
import { registerTimestampSanitizer } from '../../../utils/controller/date/cell-timestamp-sanitizer.js';
import { registerTimeOnlySanitizer } from '../../../utils/controller/date/cell-time-only-sanitizer.js';
import { registerNumberFloatSanitizer } from '../../../utils/controller/number/cell-number-float-sanitizer.js';
import { registerNumberIntSanitizer } from '../../../utils/controller/number/cell-number-int-sanitizer.js';
import { registerNumberToStringEndSanitizer } from '../../../utils/controller/number/cell-number-to-string-end-sanitizer.js';
import { registerNumberToStringIdSanitizer } from '../../../utils/controller/number/cell-number-to-string-id-sanitizer.js';
import { registerReplaceRegexSanitizer } from '../../../utils/controller/replace/cell-replace-regex-sanitizer.js';
import { registerReplaceStrSanitizer } from '../../../utils/controller/replace/cell-replace-str-sanitizer.js';
import { registerNullToEmptySanitizer } from '../../../utils/controller/string/cell-null-to-empty-sanitizer.js';
import { registerStringCollapseSpacesSanitizer } from '../../../utils/controller/string/cell-string-collapse-spaces-sanitizer.js';
import { registerStringLowerSanitizer } from '../../../utils/controller/string/cell-string-lower-sanitizer.js';
import { registerStringMaxLengthSanitizer } from '../../../utils/controller/string/cell-string-max-length-sanitizer.js';
import { registerStringPadEndSanitizer } from '../../../utils/controller/string/cell-string-pad-end-sanitizer.js';
import { registerStringPadStartSanitizer } from '../../../utils/controller/string/cell-string-pad-start-sanitizer.js';
import { registerStringUpperSanitizer } from '../../../utils/controller/string/cell-string-upper-sanitizer.js';
import { registerTrimSanitizer } from '../../../utils/controller/string/cell-trim-sanitizer.js';
import type {
  ConvertedSheet,
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../convert/types/converted-sheet.js';

type CellSanitizerFn = (
  cell: ConvertedSheetCell,
  row: ConvertedSheetRow,
  p?: Readonly<Record<string, unknown>>
) => ConvertedSheetCell;

type RowSanitizerFn = (
  row: ConvertedSheetRow,
  p?: Readonly<Record<string, unknown>>
) => ConvertedSheetRow | null;

type SheetSanitizerFn = (
  sheet: ConvertedSheet,
  p?: Readonly<Record<string, unknown>>
) => ConvertedSheet;

const registry = new Registry<(...args: unknown[]) => unknown>();

function register(
  reg: (r: (n: string, fn: CellSanitizerFn, o: { type: 'cell' }) => void) => void
): void {
  reg((name, fn, opts) => registry.register(name, fn, opts));
}

register(registerTrimSanitizer);
register(registerNumberIntSanitizer);
register(registerNumberFloatSanitizer);
register(registerNumberToStringIdSanitizer);
register(registerNumberToStringEndSanitizer);
register(registerDateFormatSanitizer);
register(registerDateYearSanitizer);
register(registerDateOnlySanitizer);
register(registerTimeOnlySanitizer);
register(registerTimestampSanitizer);
register(registerStringLowerSanitizer);
register(registerStringUpperSanitizer);
register(registerStringMaxLengthSanitizer);
register(registerStringPadEndSanitizer);
register(registerStringPadStartSanitizer);
register(registerStringCollapseSpacesSanitizer);
register(registerNullToEmptySanitizer);
register(registerReplaceRegexSanitizer);
register(registerReplaceStrSanitizer);

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
