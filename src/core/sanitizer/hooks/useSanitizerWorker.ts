import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { ConvertedSheet } from '../../convert/types/converted-sheet.js';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../types/sanitized-sheet.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { getSanitizerWorkerUrl } from '../worker/worker-url.js';

type SanitizerWorkerApi = {
  sanitize: (
    convertedSheet: ConvertedSheet,
    sheetLayout: SheetLayout,
    options?: Record<string, unknown>,
    onProgress?: (d: ImporterProgressDetail) => void,
  ) => Promise<SanitizedSheet>;
};

export function useSanitizerWorker() {
  const { setActiveWorker, dispatchProgress } = useImporterContext();
  const [workerProxy, setWorkerProxy] = useState<Comlink.Remote<SanitizerWorkerApi> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(getSanitizerWorkerUrl(), { type: 'module' });
    workerRef.current = worker;
    setActiveWorker(worker);
    const proxy = Comlink.wrap<SanitizerWorkerApi>(worker);
    queueMicrotask(() => setWorkerProxy(proxy));
    return () => {
      worker.terminate();
      workerRef.current = null;
      setActiveWorker(null);
    };
  }, [setActiveWorker]);

  const sanitize = useCallback(
    async (
      convertedSheet: ConvertedSheet,
      sheetLayout: SheetLayout,
      options?: Record<string, unknown>,
      onProgress?: (d: ImporterProgressDetail) => void,
    ): Promise<SanitizedSheet> => {
      if (!workerProxy) throw new Error('Sanitizer worker not ready');
      const progressCb = onProgress ?? dispatchProgress;
      const progressProxy = Comlink.proxy(progressCb);
      return workerProxy.sanitize(convertedSheet, sheetLayout, options ?? {}, progressProxy);
    },
    [workerProxy, dispatchProgress],
  );

  return { sanitize, dispatchProgress, isReady: !!workerProxy };
}
