import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../../sanitizer/types/sanitized-sheet.js';
import type { ValidatorDelta } from '../types/validator-delta.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { buildInitialSheet } from '../build-initial-sheet.js';
import { applyValidatorDelta } from '../patch-delta.js';
import { getValidatorWorkerUrl } from '../worker/worker-url.js';

export interface ValidatorWorkerOptions {
  signal?: AbortSignal;
}

type ValidatorWorkerApi = {
  validate: (
    sanitizedSheet: SanitizedSheet,
    sheetLayout: SheetLayout,
    options?: ValidatorWorkerOptions,
    onProgress?: (d: ImporterProgressDetail) => void,
  ) => Promise<ValidatorDelta>;
};

export function useValidatorWorker() {
  const { setActiveWorker, dispatchProgress, setResult, layout, setPhaseTiming } =
    useImporterContext();
  const [workerProxy, setWorkerProxy] = useState<Comlink.Remote<ValidatorWorkerApi> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(getValidatorWorkerUrl(), { type: 'module' });
    workerRef.current = worker;
    setActiveWorker(worker);
    const proxy = Comlink.wrap<ValidatorWorkerApi>(worker);
    queueMicrotask(() => setWorkerProxy(proxy));
    return () => {
      worker.terminate();
      workerRef.current = null;
      setActiveWorker(null);
    };
  }, [setActiveWorker]);

  const validate = useCallback(
    async (
      sanitizedSheet: SanitizedSheet,
      sheetLayout: SheetLayout,
      options?: ValidatorWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void,
    ): Promise<ValidatorDelta> => {
      if (!workerProxy) throw new Error('Validator worker not ready');
      const progressCb = onProgress ?? dispatchProgress;
      const progressProxy = Comlink.proxy(progressCb);
      return workerProxy.validate(sanitizedSheet, sheetLayout, options ?? {}, progressProxy);
    },
    [workerProxy, dispatchProgress],
  );

  const validateAndApply = useCallback(
    async (
      sanitizedSheet: SanitizedSheet,
      options?: ValidatorWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void,
    ): Promise<ValidatorDelta> => {
      if (!layout) throw new Error('Layout required for validation');
      const t0 = performance.now();
      const delta = await validate(sanitizedSheet, layout, options, onProgress);
      const t1 = performance.now();
      setPhaseTiming('validate', t1 - t0);
      const initial = buildInitialSheet(sanitizedSheet, {
        name: layout.name,
        version: layout.version,
      });
      const patched = applyValidatorDelta(initial, delta);
      setResult(patched);
      return delta;
    },
    [layout, validate, setResult, setPhaseTiming],
  );

  return { validate, validateAndApply, dispatchProgress, isReady: !!workerProxy };
}
