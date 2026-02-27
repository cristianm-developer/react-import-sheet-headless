import { useEffect, useMemo, useRef, useState } from 'react';
import { Registry } from '../shared/registry/index.js';
import type { ParserEngine, SheetLayout } from '../types/index.js';
import { ImporterContext } from './ImporterContext.js';
import { initialState } from './state.js';
import type { ImporterContextValue, ImporterProviderProps } from './types.js';
import { useImporterActions } from './useImporterActions.js';
export function ImporterProvider({ children, layout: layoutProp, engine: engineProp }: ImporterProviderProps) {
  const [state, setState] = useState(initialState);
  const [layout, setLayoutState] = useState<SheetLayout | null>(layoutProp ?? null);
  const [engine, setEngineState] = useState<ParserEngine | null>(engineProp ?? null);
  const progressEventTarget = useMemo(() => new EventTarget(), []);
  const validatorRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const sanitizerRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const transformRegistry = useMemo(() => new Registry<(...args: unknown[]) => unknown>(), []);
  const activeWorkerRef = useRef<Worker | null>(null);

  const actions = useImporterActions({
    setState,
    setLayoutState,
    setEngineState,
    progressEventTarget,
    validatorRegistry,
    sanitizerRegistry,
    transformRegistry,
    activeWorkerRef,
  });

  useEffect(() => {
    return () => {
      const worker = activeWorkerRef.current;
      if (worker) {
        worker.terminate();
        activeWorkerRef.current = null;
      }
    };
  }, []);

  const value = useMemo<ImporterContextValue>(
    () => ({
      ...state,
      layout,
      engine,
      progressEventTarget,
      ...actions,
    }),
    [state, layout, engine, progressEventTarget, actions],
  );

  return (
    <ImporterContext.Provider value={value}>
      {children}
    </ImporterContext.Provider>
  );
}
