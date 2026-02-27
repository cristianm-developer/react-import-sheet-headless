import type { SheetError } from '../../../types/error.js';

export interface TransformDeltaItem {
  readonly row: number;
  readonly col: string;
  readonly newValue: unknown;
}

export interface TransformDelta {
  readonly deltas: readonly TransformDeltaItem[];
}

export interface TransformResult {
  readonly deltas: readonly TransformDeltaItem[];
  readonly errors?: readonly SheetError[];
}
