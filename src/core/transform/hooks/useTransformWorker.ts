import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { TransformResult } from '../types/transform-delta.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { applyTransformDelta } from '../delta-applier.js';
import { getTransformWorkerUrl } from '../worker/worker-url.js';

export interface TransformWorkerOptions {
  signal?: AbortSignal;
}

type TransformWorkerApi = {
  transform: (
    sheet: Sheet,
    sheetLayout: SheetLayout,
    options?: TransformWorkerOptions,
    onProgress?: (d: ImporterProgressDetail) => void,
  ) => Promise<TransformResult>;
};

export function useTransformWorker() {
  const { setActiveWorker, dispatchProgress, setResult, layout } = useImporterContext();
  const [workerProxy, setWorkerProxy] = useState<Comlink.Remote<TransformWorkerApi> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(getTransformWorkerUrl(), { type: 'module' });
    workerRef.current = worker;
    setActiveWorker(worker);
    const proxy = Comlink.wrap<TransformWorkerApi>(worker);
    queueMicrotask(() => setWorkerProxy(proxy));
    return () => {
      worker.terminate();
      workerRef.current = null;
      setActiveWorker(null);
    };
  }, [setActiveWorker]);

  const transform = useCallback(
    async (
      sheet: Sheet,
      sheetLayout: SheetLayout,
      options?: TransformWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void,
    ): Promise<TransformResult> => {
      if (!workerProxy) throw new Error('Transform worker not ready');
      const progressCb = onProgress ?? dispatchProgress;
      const progressProxy = Comlink.proxy(progressCb);
      return workerProxy.transform(sheet, sheetLayout, options ?? {}, progressProxy);
    },
    [workerProxy, dispatchProgress],
  );

  const transformAndApply = useCallback(
    async (
      sheet: Sheet,
      options?: TransformWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void,
    ): Promise<TransformResult> => {
      if (!layout) throw new Error('Layout required for transform');
      const result = await transform(sheet, layout, options, onProgress);
      const patched = applyTransformDelta(sheet, { deltas: result.deltas });
      const nextSheet =
        result.errors?.length ?
          { ...patched, errors: [...patched.errors, ...result.errors] }
        : patched;
      setResult(nextSheet);
      return result;
    },
    [layout, transform, setResult],
  );

  return { transform, transformAndApply, dispatchProgress, isReady: !!workerProxy };
}
