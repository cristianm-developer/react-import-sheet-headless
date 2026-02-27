import type { PersistedState } from '../types/persisted-state.js';
import {
  PERSIST_STORE_NAME,
  PERSIST_SESSION_MAX_AGE_MS,
} from '../types/persisted-state.js';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('react-import-sheet-db', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(PERSIST_STORE_NAME, { keyPath: 'key' });
    };
  });
}

export async function savePersistedState(
  key: string,
  state: PersistedState,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PERSIST_STORE_NAME, 'readwrite');
    const store = tx.objectStore(PERSIST_STORE_NAME);
    const record = { key, ...state };
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadPersistedState(
  key: string,
): Promise<PersistedState | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PERSIST_STORE_NAME, 'readonly');
    const store = tx.objectStore(PERSIST_STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => {
      db.close();
      const row = req.result as (PersistedState & { key: string }) | undefined;
      if (row == null) {
        resolve(null);
        return;
      }
      const savedAt = row.savedAt;
      if (Date.now() - savedAt > PERSIST_SESSION_MAX_AGE_MS) {
        resolve(null);
        return;
      }
      const { key: _k, ...state } = row;
      resolve(state as PersistedState);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearPersistedState(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PERSIST_STORE_NAME, 'readwrite');
    const store = tx.objectStore(PERSIST_STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
