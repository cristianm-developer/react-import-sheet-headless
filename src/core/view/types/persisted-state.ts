import type { RawSheet } from '../../../types/raw-sheet.js';
import type { Sheet } from '../../../types/sheet.js';

export const PERSIST_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const PERSIST_STORE_NAME = 'react-import-sheet-persist';

export const DEFAULT_PERSIST_KEY = 'react-import-sheet-session';

export const STATE_SCHEMA_VERSION = 1;

export interface PersistedState {
  readonly rawData: RawSheet;
  readonly sheet: Sheet;
  readonly savedAt: number;
  readonly fileName?: string;
  readonly persistKey?: string;
  readonly layoutVersion?: string | number;
  readonly stateSchemaVersion?: number;
}
