import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePersistedState,
  loadPersistedState,
  clearPersistedState,
} from './indexed-db.js';
import { PERSIST_SESSION_MAX_AGE_MS } from '../types/persisted-state.js';

const minimalRawSheet = {
  name: 's',
  filesize: 0,
  documentHash: 'h',
  headers: ['a'],
  rows: [{ index: 0, cells: [{ key: 'a', value: 1 }] }],
} as import('../../../types/raw-sheet.js').RawSheet;

const minimalSheet = {
  ...minimalRawSheet,
  sheetLayout: { name: 'l', version: 1 },
  errors: [],
  rows: [
    {
      index: 0,
      errors: [],
      cells: [{ key: 'a', value: 1, errors: [] }],
    },
  ],
} as import('../../../types/sheet.js').Sheet;

describe('persist (IndexedDB)', () => {
  const key = 'test-key';

  beforeEach(async () => {
    await clearPersistedState(key);
  });

  it('should save and load state', async () => {
    const state = {
      rawData: minimalRawSheet,
      sheet: minimalSheet,
      savedAt: Date.now(),
    };
    await savePersistedState(key, state);
    const loaded = await loadPersistedState(key);
    expect(loaded).not.toBeNull();
    expect(loaded!.rawData.documentHash).toBe('h');
    expect(loaded!.sheet.rows).toHaveLength(1);
  });

  it('should return null when key does not exist', async () => {
    const loaded = await loadPersistedState('nonexistent');
    expect(loaded).toBeNull();
  });

  it('should return null when session is older than 7 days', async () => {
    const state = {
      rawData: minimalRawSheet,
      sheet: minimalSheet,
      savedAt: Date.now() - PERSIST_SESSION_MAX_AGE_MS - 1,
    };
    await savePersistedState(key, state);
    const loaded = await loadPersistedState(key);
    expect(loaded).toBeNull();
  });

  it('should load when session is within 7 days', async () => {
    const state = {
      rawData: minimalRawSheet,
      sheet: minimalSheet,
      savedAt: Date.now() - PERSIST_SESSION_MAX_AGE_MS + 1000,
    };
    await savePersistedState(key, state);
    const loaded = await loadPersistedState(key);
    expect(loaded).not.toBeNull();
  });

  it('should clear persisted state', async () => {
    const state = {
      rawData: minimalRawSheet,
      sheet: minimalSheet,
      savedAt: Date.now(),
    };
    await savePersistedState(key, state);
    await clearPersistedState(key);
    const loaded = await loadPersistedState(key);
    expect(loaded).toBeNull();
  });
});
