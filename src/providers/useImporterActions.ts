import { useCallback, useMemo } from 'react';
import type { RegistryLevel } from '../shared/registry/index.js';
import {
  IMPORTER_ABORTED_EVENT,
  IMPORTER_PROGRESS_EVENT,
  type ImporterProgressDetail,
} from '../types/index.js';
import type { ImporterContextValue, UseImporterActionsDeps } from './types.js';
import { useImporterStateSetters } from './useImporterStateSetters.js';

export function useImporterActions(deps: UseImporterActionsDeps): Omit<
  ImporterContextValue,
  'file' | 'rawData' | 'documentHash' | 'status' | 'result' | 'layout' | 'engine' | 'progressEventTarget'
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
  } = deps;

  const stateSetters = useImporterStateSetters({ setState, setLayoutState, setEngineState });

  const dispatchProgress = useCallback(
    (detail: ImporterProgressDetail) => {
      progressEventTarget.dispatchEvent(
        new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }),
      );
    },
    [progressEventTarget],
  );

  const setActiveWorker = useCallback((worker: Worker | null) => {
    activeWorkerRef.current = worker;
  }, [activeWorkerRef]);

  const abort = useCallback(() => {
    const worker = activeWorkerRef.current;
    if (worker) {
      worker.terminate();
      activeWorkerRef.current = null;
    }
    setState((prev) => ({ ...prev, status: 'cancelled' }));
    progressEventTarget.dispatchEvent(new CustomEvent(IMPORTER_ABORTED_EVENT));
  }, [activeWorkerRef, progressEventTarget, setState]);

  const processFile = useCallback(
    (file: File) => {
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
      }));
    },
    [setState],
  );

  const registerValidator = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      validatorRegistry.register(name, fn, options);
    },
    [validatorRegistry],
  );

  const registerSanitizer = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      sanitizerRegistry.register(name, fn, options);
    },
    [sanitizerRegistry],
  );

  const registerTransform = useCallback(
    (name: string, fn: (...args: unknown[]) => unknown, options: { type: RegistryLevel }) => {
      transformRegistry.register(name, fn, options);
    },
    [transformRegistry],
  );

  return useMemo(
    () => ({
      ...stateSetters,
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
      processFile,
      registerValidator,
      registerSanitizer,
      registerTransform,
      abort,
      dispatchProgress,
      setActiveWorker,
    ],
  );
}
