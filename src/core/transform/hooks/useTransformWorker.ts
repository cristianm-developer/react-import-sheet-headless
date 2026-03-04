import { useCallback } from 'react';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { TransformResult } from '../types/transform-delta.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { applyTransformDelta } from '../delta-applier.js';
import { runTransform } from '../runner/run-transform.js';
import { getTransformGetters } from '../worker/worker-registry.js';

export interface TransformWorkerOptions {
  signal?: AbortSignal;
}

export function useTransformWorker() {
  const { dispatchProgress, setResult, layout, setPhaseTiming, finalizeMetrics } =
    useImporterContext();

  const transform = useCallback(
    async (
      sheet: Sheet,
      sheetLayout: SheetLayout,
      options?: TransformWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void
    ): Promise<TransformResult> => {
      const progressCb = onProgress ?? dispatchProgress;
      const getters = getTransformGetters();
      return runTransform(sheet, sheetLayout, getters, progressCb, options?.signal);
    },
    [dispatchProgress]
  );

  const transformAndApply = useCallback(
    async (
      sheet: Sheet,
      options?: TransformWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void
    ): Promise<TransformResult> => {
      if (!layout) throw new Error('Layout required for transform');
      const t0 = performance.now();
      const result = await transform(sheet, layout, options, onProgress);
      const t1 = performance.now();
      setPhaseTiming('transform', t1 - t0);
      const patched = applyTransformDelta(sheet, { deltas: result.deltas });
      const nextSheet = result.errors?.length
        ? { ...patched, errors: [...patched.errors, ...result.errors] }
        : patched;
      setResult(nextSheet);
      finalizeMetrics(nextSheet.rows.length);
      return result;
    },
    [layout, transform, setResult, setPhaseTiming, finalizeMetrics]
  );

  return { transform, transformAndApply, dispatchProgress, isReady: true };
}
