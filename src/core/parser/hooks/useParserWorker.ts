import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { RawParseResult } from '../../../types/raw-sheet.js';
import type { ParseOptions } from '../types/index.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { getParserWorkerUrl } from '../worker/worker-url.js';

type ParserWorkerApi = {
  load: (blob: Blob, options?: ParseOptions) => Promise<RawParseResult>;
  parseAll: (onProgress?: (d: ImporterProgressDetail) => void) => Promise<RawParseResult>;
};

export function useParserWorker() {
  const { setActiveWorker, dispatchProgress } = useImporterContext();
  const [workerProxy, setWorkerProxy] = useState<Comlink.Remote<ParserWorkerApi> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(getParserWorkerUrl(), { type: 'module' });
    workerRef.current = worker;
    setActiveWorker(worker);
    const proxy = Comlink.wrap<ParserWorkerApi>(worker);
    queueMicrotask(() => setWorkerProxy(proxy));
    return () => {
      worker.terminate();
      workerRef.current = null;
      setActiveWorker(null);
    };
  }, [setActiveWorker]);

  const load = useCallback(
    async (blob: Blob, options: ParseOptions = {}): Promise<RawParseResult> => {
      if (!workerProxy) throw new Error('Parser worker not ready');
      return workerProxy.load(blob, options);
    },
    [workerProxy],
  );

  const parseAll = useCallback(
    async (onProgress?: (d: ImporterProgressDetail) => void): Promise<RawParseResult> => {
      if (!workerProxy) throw new Error('Parser worker not ready');
      const progressProxy = onProgress ? Comlink.proxy(onProgress) : undefined;
      return workerProxy.parseAll(progressProxy);
    },
    [workerProxy],
  );

  return { load, parseAll, dispatchProgress, isReady: !!workerProxy };
}
