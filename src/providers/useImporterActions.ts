import { useCallback, useMemo } from 'react';
import type { RegistryLevel } from '../shared/registry/index.js';
import type { ChangeLogEntry } from '../types/change-log.js';
import {
  buildPipelineMetrics,
  IMPORTER_ABORTED_EVENT,
  IMPORTER_PROGRESS_EVENT,
  type ImporterProgressDetail,
  type PipelinePhase,
} from '../types/index.js';
import type { ImporterContextValue, UseImporterActionsDeps } from './types.js';
import { useImporterStateSetters } from './useImporterStateSetters.js';

const INITIAL_PHASE_TIMINGS = {
  parse: 0,
  sanitize: 0,
  validate: 0,
  transform: 0,
};

export function useImporterActions(
  deps: UseImporterActionsDeps
): Omit<
  ImporterContextValue,
  | 'file'
  | 'rawData'
  | 'documentHash'
  | 'status'
  | 'result'
  | 'layout'
  | 'engine'
  | 'progressEventTarget'
  | 'onSubmit'
  | 'submitKeyMap'
  | 'persist'
  | 'persistKey'
  | 'hasRecoverableSession'
  | 'recoverSession'
  | 'clearPersistedState'
> {
  const {
    setState,
    setLayoutState,
    setEngineState,
    progressEventTarget,
    validatorRegistry,
    sanitizerRegistry,
    transformRegistry,
    activeWorkerRef,
    phaseTimingsRef,
  } = deps;

  const stateSetters = useImporterStateSetters({ setState, setLayoutState, setEngineState });

  const dispatchProgress = useCallback(
    (detail: ImporterProgressDetail) => {
      progressEventTarget.dispatchEvent(new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }));
    },
    [progressEventTarget]
  );

  const setActiveWorker = useCallback(
    (worker: Worker | null) => {
      activeWorkerRef.current = worker;
    },
    [activeWorkerRef]
  );

  const abort = useCallback(() => {
    const worker = activeWorkerRef.current;
    if (worker) {
      worker.terminate();
      activeWorkerRef.current = null;
    }
    setState((prev) => ({ ...prev, status: 'cancelled' }));
    progressEventTarget.dispatchEvent(new CustomEvent(IMPORTER_ABORTED_EVENT));
  }, [activeWorkerRef, progressEventTarget, setState]);

  const setPhaseTiming = useCallback(
    (phase: PipelinePhase, ms: number) => {
      phaseTimingsRef.current = { ...phaseTimingsRef.current, [phase]: ms };
    },
    [phaseTimingsRef]
  );

  const finalizeMetrics = useCallback(
    (rowCount: number) => {
      const timings = { ...phaseTimingsRef.current };
      const metrics = buildPipelineMetrics(timings, rowCount);
      stateSetters.setMetrics(metrics);
    },
    [phaseTimingsRef, stateSetters]
  );

  const addChangeLogEntry = useCallback(
    (entry: ChangeLogEntry) => {
      setState((prev) => ({
        ...prev,
        changeLog: [...prev.changeLog, entry],
      }));
    },
    [setState]
  );

  const processFile = useCallback(
    (file: File) => {
      phaseTimingsRef.current = { ...INITIAL_PHASE_TIMINGS };
      setState((prev) => ({
        ...prev,
        file,
        status: 'loading',
        rawData: null,
        documentHash: null,
        result: null,
        convertedSheet: null,
        sanitizedSheet: null,
        convertResultData: null,
        metrics: null,
        changeLog: [],
        submitDone: false,
        globalErrors: [],
      }));
    },
    [phaseTimingsRef, setState]
  );

  const registerValidator = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      validatorRegistry.register(name, fn, options);
    },
    [validatorRegistry]
  );

  const registerSanitizer = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      sanitizerRegistry.register(name, fn, options);
    },
    [sanitizerRegistry]
  );

  const registerTransform = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      transformRegistry.register(name, fn, options);
    },
    [transformRegistry]
  );

  return useMemo(
    () => ({
      ...stateSetters,
      addChangeLogEntry,
      setPhaseTiming,
      finalizeMetrics,
      processFile,
      registerValidator,
      registerSanitizer,
      registerTransform,
      abort,
      dispatchProgress,
      setActiveWorker,
    }),
    [
      stateSetters,
      addChangeLogEntry,
      setPhaseTiming,
      finalizeMetrics,
      processFile,
      registerValidator,
      registerSanitizer,
      registerTransform,
      abort,
      dispatchProgress,
      setActiveWorker,
    ]
  );
}
