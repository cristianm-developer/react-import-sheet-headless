import * as Comlink from 'comlink';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { TransformResult } from '../types/transform-delta.js';
import type { TransformProgressDetail } from '../types/transform-progress.js';
import { runTransform } from '../runner/run-transform.js';
import { getTransformGetters } from './worker-registry.js';

type ProgressCallback = (detail: TransformProgressDetail) => void;

export interface TransformWorkerOptions {
  signal?: AbortSignal;
}

const api = {
  async transform(
    sheet: Sheet,
    sheetLayout: SheetLayout,
    options?: TransformWorkerOptions,
    onProgress?: ProgressCallback,
  ): Promise<TransformResult> {
    const getters = getTransformGetters();
    return runTransform(
      sheet,
      sheetLayout,
      getters,
      onProgress,
      options?.signal,
    );
  },
};

Comlink.expose(api);
