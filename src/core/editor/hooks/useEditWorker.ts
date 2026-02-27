import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import { getEditWorkerUrl } from '../worker/worker-url.js';

export interface EditWorkerOptions {
  signal?: AbortSignal;
}

type EditWorkerApi = {
  runEdit: (
    sheet: Sheet,
    sheetLayout: SheetLayout,
    rowIndex: number,
    cellKey: string,
    value: unknown,
    options?: EditWorkerOptions,
  ) => Promise<Sheet>;
};

export function useEditWorker() {
  const [workerProxy, setWorkerProxy] = useState<Comlink.Remote<EditWorkerApi> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(getEditWorkerUrl(), { type: 'module' });
    workerRef.current = worker;
    const proxy = Comlink.wrap<EditWorkerApi>(worker);
    queueMicrotask(() => setWorkerProxy(proxy));
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const runEdit = useCallback(
    async (
      sheet: Sheet,
      sheetLayout: SheetLayout,
      rowIndex: number,
      cellKey: string,
      value: unknown,
      options?: EditWorkerOptions,
    ): Promise<Sheet> => {
      if (!workerProxy) throw new Error('Edit worker not ready');
      return workerProxy.runEdit(
        sheet,
        sheetLayout,
        rowIndex,
        cellKey,
        value,
        options ?? {},
      );
    },
    [workerProxy],
  );

  return { runEdit, isReady: !!workerProxy };
}
