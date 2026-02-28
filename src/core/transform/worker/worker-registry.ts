import { Registry } from '../../../shared/registry/index.js';
import { registerToUpperTransform } from '../../../utils/controller/string/cell-to-upper-transform.js';
import { registerStringToLowerTransform } from '../../../utils/controller/string/cell-string-tolower-transform.js';
import { registerStringSliceTransform } from '../../../utils/controller/string/cell-string-slice-transform.js';
import { registerStringReplaceTransform } from '../../../utils/controller/string/cell-string-replace-transform.js';
import { registerStringReplaceByRegexTransform } from '../../../utils/controller/string/cell-string-replace-regex-transform.js';
import { registerStringFillStartTransform } from '../../../utils/controller/string/cell-string-fill-start-transform.js';
import { registerStringFillEndTransform } from '../../../utils/controller/string/cell-string-fill-end-transform.js';
import { registerStringExtractByRegexTransform } from '../../../utils/controller/string/cell-string-extract-regex-transform.js';
import { registerNumberAddTransform } from '../../../utils/controller/number/cell-number-add-transform.js';
import { registerNumberMultiplyTransform } from '../../../utils/controller/number/cell-number-multiply-transform.js';
import { registerNumberDivideTransform } from '../../../utils/controller/number/cell-number-divide-transform.js';
import { registerNumberSubtractTransform } from '../../../utils/controller/number/cell-number-subtract-transform.js';
import { registerNumberRoundTransform } from '../../../utils/controller/number/cell-number-round-transform.js';
import { registerNumberAbsTransform } from '../../../utils/controller/number/cell-number-abs-transform.js';
import { registerNumberSqrtTransform } from '../../../utils/controller/number/cell-number-sqrt-transform.js';
import { registerNumberLimitTransform } from '../../../utils/controller/number/cell-number-limit-transform.js';
import { registerNumberPercentTransform } from '../../../utils/controller/number/cell-number-percent-transform.js';
import { registerDateToOnlyTimeTransform } from '../../../utils/controller/date/cell-date-to-only-time-transform.js';
import { registerDateToOnlyDateTransform } from '../../../utils/controller/date/cell-date-to-only-date-transform.js';
import { registerDateToTimeDateTransform } from '../../../utils/controller/date/cell-date-to-time-date-transform.js';
import { registerDateToUtcTransform } from '../../../utils/controller/date/cell-date-to-utc-transform.js';
import { registerDateLimitTransform } from '../../../utils/controller/date/cell-date-limit-transform.js';
import { registerDateAddTransform } from '../../../utils/controller/date/cell-date-add-transform.js';
import { registerDateSubtractTransform } from '../../../utils/controller/date/cell-date-subtract-transform.js';
import type { Sheet } from '../../../types/sheet.js';
import type { ValidatedCell, ValidatedRow } from '../../../types/sheet.js';
import type { TransformDeltaItem } from '../types/transform-delta.js';
import type { TransformGetters } from '../runner/run-transform.js';

type CellTransformFn = (
  value: unknown,
  cell: ValidatedCell,
  row: ValidatedRow,
  p?: Readonly<Record<string, unknown>>
) => unknown;

type RowTransformFn = (row: ValidatedRow, p?: Readonly<Record<string, unknown>>) => ValidatedRow;

type SheetTransformFn = (
  sheet: Sheet,
  p?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal
) => readonly TransformDeltaItem[] | Promise<readonly TransformDeltaItem[]>;

const registry = new Registry<(...args: unknown[]) => unknown>();

function registerCellTransform(name: string, fn: CellTransformFn, opts: { type: 'cell' }): void {
  registry.register(name, fn, opts);
}

registerToUpperTransform(registerCellTransform);
registerStringToLowerTransform(registerCellTransform);
registerStringSliceTransform(registerCellTransform);
registerStringReplaceTransform(registerCellTransform);
registerStringReplaceByRegexTransform(registerCellTransform);
registerStringFillStartTransform(registerCellTransform);
registerStringFillEndTransform(registerCellTransform);
registerStringExtractByRegexTransform(registerCellTransform);
registerNumberAddTransform(registerCellTransform);
registerNumberMultiplyTransform(registerCellTransform);
registerNumberDivideTransform(registerCellTransform);
registerNumberSubtractTransform(registerCellTransform);
registerNumberRoundTransform(registerCellTransform);
registerNumberAbsTransform(registerCellTransform);
registerNumberSqrtTransform(registerCellTransform);
registerNumberLimitTransform(registerCellTransform);
registerNumberPercentTransform(registerCellTransform);
registerDateToOnlyTimeTransform(registerCellTransform);
registerDateToOnlyDateTransform(registerCellTransform);
registerDateToTimeDateTransform(registerCellTransform);
registerDateToUtcTransform(registerCellTransform);
registerDateLimitTransform(registerCellTransform);
registerDateAddTransform(registerCellTransform);
registerDateSubtractTransform(registerCellTransform);

function getCellTransform(name: string): CellTransformFn | undefined {
  const entry = registry.get(name);
  if (!entry || entry.type !== 'cell') return undefined;
  return entry.fn as CellTransformFn;
}

function getRowTransform(_name: string): RowTransformFn | undefined {
  return undefined;
}

function getSheetTransform(_name: string): SheetTransformFn | undefined {
  return undefined;
}

export function getTransformGetters(): TransformGetters {
  return {
    getCellTransform,
    getRowTransform,
    getSheetTransform,
  };
}
