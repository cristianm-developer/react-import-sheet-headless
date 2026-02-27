import type { BaseSheet } from './raw-sheet.js';
import type { SheetError } from './error.js';
import type { SheetLayoutRef } from './sheet-layout.js';

export interface ValidatedCell {
  readonly key: string;
  readonly value: unknown;
  readonly errors: readonly SheetError[];
}

export interface ValidatedRow {
  readonly index: number;
  readonly errors: readonly SheetError[];
  readonly cells: readonly ValidatedCell[];
}

export interface Sheet extends BaseSheet<ValidatedRow> {
  readonly sheetLayout: SheetLayoutRef;
  readonly mimetype?: string;
  readonly extension?: string;
  readonly errors: readonly SheetError[];
}
