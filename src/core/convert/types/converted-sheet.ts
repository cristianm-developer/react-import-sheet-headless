import type { BaseSheet } from '../../../types/raw-sheet.js';
import type { RawSheetCellValue } from '../../../types/raw-sheet.js';

export interface ConvertedSheetCell {
  readonly key: string;
  readonly value: RawSheetCellValue;
}

export interface ConvertedSheetRow {
  readonly index: number;
  readonly cells: readonly ConvertedSheetCell[];
}

export type ConvertedSheet = BaseSheet<ConvertedSheetRow>;
