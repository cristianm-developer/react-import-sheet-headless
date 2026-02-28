import type { ColumnMismatch } from './column-mismatch.js';

export interface ConvertMismatchData {
  readonly kind: 'mismatch';
  readonly headersFound: readonly string[];
  readonly mismatches: readonly ColumnMismatch[];
  readonly columnOrder: readonly string[];
  readonly headerToFieldMap: Readonly<Record<string, string>>;
  readonly layoutError?: boolean;
}
