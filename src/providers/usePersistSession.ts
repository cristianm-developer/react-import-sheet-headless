import { useCallback, useEffect, useRef, useState } from 'react';
import type { RawSheet } from '../types/raw-sheet.js';
import type { Sheet } from '../types/sheet.js';
import {
  savePersistedState,
  loadPersistedState,
  clearPersistedState as clearPersistedStateStorage,
} from '../core/view/persist/indexed-db.js';
import {
  STATE_SCHEMA_VERSION,
  type PersistedState as PersistedStateType,
} from '../core/view/types/persisted-state.js';

const DEBOUNCE_MS = 2500;

export function usePersistSession(
  persist: boolean,
  persistKey: string,
  rawData: RawSheet | null,
  result: Sheet | null,
  setRawData: (v: RawSheet | null) => void,
  setResult: (v: Sheet | null) => void,
  layoutVersion: string | number | null,
) {
  const [recoverableSession, setRecoverableSession] = useState<PersistedStateType | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!persist) return;
    loadPersistedState(persistKey).then((state) => {
      if (!state) return;
      if (
        state.layoutVersion != null &&
        layoutVersion != null &&
        String(state.layoutVersion) !== String(layoutVersion)
      ) {
        return;
      }
      setRecoverableSession(state);
    });
  }, [persist, persistKey, layoutVersion]);

  useEffect(() => {
    if (!persist || !rawData || !result) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const payload: PersistedStateType = {
        rawData,
        sheet: result,
        savedAt: Date.now(),
        layoutVersion: layoutVersion ?? undefined,
        stateSchemaVersion: STATE_SCHEMA_VERSION,
      };
      savePersistedState(persistKey, payload).catch(() => {});
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [persist, persistKey, rawData, result, layoutVersion]);

  const recoverSession = useCallback(async () => {
    if (!persist) return;
    const state = recoverableSession;
    if (!state) return;
    setRawData(state.rawData);
    setResult(state.sheet);
    setRecoverableSession(null);
  }, [persist, recoverableSession, setRawData, setResult]);

  const clearPersistedState = useCallback(async () => {
    if (!persist) return;
    await clearPersistedStateStorage(persistKey);
    setRecoverableSession(null);
  }, [persist, persistKey]);

  return {
    hasRecoverableSession: persist && recoverableSession != null,
    recoverSession,
    clearPersistedState,
  };
}
