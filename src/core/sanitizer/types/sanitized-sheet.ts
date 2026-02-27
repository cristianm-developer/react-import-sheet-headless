import type { BaseSheet } from '../../../types/raw-sheet.js';
import type { RawSheetCellValue } from '../../../types/raw-sheet.js';

export interface SanitizedSheetCell {
  readonly key: string;
  readonly value: RawSheetCellValue;
}

export interface SanitizedSheetRow {
  readonly index: number;
  readonly cells: readonly SanitizedSheetCell[];
}

export type SanitizedSheet = BaseSheet<SanitizedSheetRow>;
