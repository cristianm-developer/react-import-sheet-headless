import type { ConvertedSheet } from './converted-sheet.js';
import type { ConvertMismatchData } from './convert-mismatch-data.js';

export interface ConvertResult extends ConvertMismatchData {
  reorderColumns: (fieldNames: string[]) => void;
  renameColumn: (fileHeader: string, layoutFieldName: string) => void;
  applyMapping: () => ConvertResultApplyResult;
}

export type ConvertResultApplyResult =
  | { kind: 'success'; sheet: ConvertedSheet }
  | { kind: 'mismatch'; result: ConvertMismatchData };
