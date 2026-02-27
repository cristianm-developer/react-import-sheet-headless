import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ImporterState,
  ImporterStatus,
  ImporterProgressDetail,
} from './types';
import { IMPORTER_PROGRESS_EVENT } from './types';

const initialState: ImporterState = {
  file: null,
  rawData: [],
  status: 'idle',
};

export interface ImporterContextValue extends ImporterState {
  setFile: (file: File | null) => void;
  setRawData: (rawData: unknown[]) => void;
  setStatus: (status: ImporterStatus) => void;
  reset: () => void;
  /** EventTarget para progreso: disparar `importer-progress` aquí; solo la barra de progreso debe suscribirse (evitar re-renders). */
  progressEventTarget: EventTarget;
  /** Dispara el evento de progreso con el detail dado. Los hooks del Worker lo usan en lugar de actualizar Context. */
  dispatchProgress: (detail: ImporterProgressDetail) => void;
}

const ImporterContext = createContext<ImporterContextValue | null>(null);

export interface ImportProviderProps {
  children: ReactNode;
  /** Estado inicial opcional. */
  initialState?: Partial<ImporterState>;
}

export function ImportProvider({ children, initialState: initial }: ImportProviderProps) {
  const [state, setState] = useState<ImporterState>({
    ...initialState,
    ...initial,
  });

  const progressEventTarget = useMemo(() => new EventTarget(), []);

  const setFile = useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, file }));
  }, []);

  const setRawData = useCallback((rawData: unknown[]) => {
    setState((prev) => ({ ...prev, rawData }));
  }, []);

  const setStatus = useCallback((status: ImporterStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...initialState, ...initial });
  }, [initial]);

  const dispatchProgress = useCallback((detail: ImporterProgressDetail) => {
    progressEventTarget.dispatchEvent(
      new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }),
    );
  }, [progressEventTarget]);

  const value = useMemo<ImporterContextValue>(
    () => ({
      ...state,
      setFile,
      setRawData,
      setStatus,
      reset,
      progressEventTarget,
      dispatchProgress,
    }),
    [state, setFile, setRawData, setStatus, reset, progressEventTarget, dispatchProgress],
  );

  return (
    <ImporterContext.Provider value={value}>
      {children}
    </ImporterContext.Provider>
  );
}

export function useImporter(): ImporterContextValue {
  const context = useContext(ImporterContext);
  if (context === null) {
    throw new Error('useImporter must be used within an ImportProvider');
  }
  return context;
}
