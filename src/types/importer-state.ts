import type { RawSheet } from './raw-sheet.js';
import type { Sheet } from './sheet.js';

export type ImporterStatus = 'idle' | 'loading' | 'parsing' | 'validating' | 'success' | 'error' | 'cancelled';

export interface ImporterState {
  readonly file: File | null;
  readonly rawData: RawSheet | null;
  readonly documentHash: string | null;
  readonly status: ImporterStatus;
  readonly result: Sheet | null;
}

export const IMPORTER_PROGRESS_EVENT = 'importer-progress';
export const IMPORTER_ABORTED_EVENT = 'importer-aborted';

export interface ImporterProgressDetail {
  readonly phase?: string;
  readonly globalPercent?: number;
  readonly localPercent?: number;
  readonly currentRow?: number;
  readonly totalRows?: number;
  readonly rowsProcessed?: number;
}
