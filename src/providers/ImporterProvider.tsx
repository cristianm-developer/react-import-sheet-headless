import { useMemo, useRef, useState } from 'react';
import { Registry } from '../shared/registry/index.js';
import type { ParserEngine, SheetLayout } from '../types/index.js';
import { DEFAULT_PERSIST_KEY } from '../core/view/types/persisted-state.js';
import { ImporterContext } from './ImporterContext.js';
import { initialState } from './state.js';
import type { ImporterContextValue, ImporterProviderProps } from './types.js';
import { useImporterActions } from './useImporterActions.js';
import { useImporterStateSetters } from './useImporterStateSetters.js';
import { usePersistSession } from './usePersistSession.js';
import { useImportSheet } from '../hooks/useImportSheet.js';

function ImporterOrchestrator() {
  useImportSheet();
  return null;
}

export function ImporterProvider({
  children,
  layout: layoutProp,
  engine: engineProp,
  persist = false,
  persistKey = DEFAULT_PERSIST_KEY,
  onSubmit = null,
  submitKeyMap = null,
}: ImporterProviderProps) {
  const [state, setState] = useState(initialState);
  const [layout, setLayoutState] = useState<SheetLayout | null>(layoutProp ?? null);
  const [engine, setEngineState] = useState<ParserEngine | null>(engineProp ?? null);
  const progressEventTarget = useMemo(() => new EventTarget(), []);
  const validatorRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const sanitizerRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const transformRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const phaseTimingsRef = useRef({
    parse: 0,
    sanitize: 0,
    validate: 0,
    transform: 0,
  });

  const stateSetters = useImporterStateSetters({ setState, setLayoutState, setEngineState });
  const persistSession = usePersistSession(
    persist,
    persistKey,
    state.rawData,
    state.result,
    stateSetters.setRawData,
    stateSetters.setResult,
    layout?.version ?? null
  );

  const actions = useImporterActions({
    setState,
    setLayoutState,
    setEngineState,
    progressEventTarget,
    validatorRegistry,
    sanitizerRegistry,
    transformRegistry,
    phaseTimingsRef,
  });

  const value = useMemo<ImporterContextValue>(
    () => ({
      ...state,
      layout,
      engine,
      progressEventTarget,
      ...actions,
      onSubmit: onSubmit ?? null,
      submitKeyMap: submitKeyMap ?? null,
      persist,
      persistKey,
      hasRecoverableSession: persistSession.hasRecoverableSession,
      recoverSession: persistSession.recoverSession,
      clearPersistedState: persistSession.clearPersistedState,
    }),
    [
      state,
      layout,
      engine,
      progressEventTarget,
      onSubmit,
      submitKeyMap,
      actions,
      persist,
      persistKey,
      persistSession.hasRecoverableSession,
      persistSession.recoverSession,
      persistSession.clearPersistedState,
    ]
  );

  return (
    <ImporterContext.Provider value={value}>
      <ImporterOrchestrator />
      {children}
    </ImporterContext.Provider>
  );
}
