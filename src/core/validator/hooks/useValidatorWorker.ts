import { useCallback } from 'react';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../../sanitizer/types/sanitized-sheet.js';
import type { ValidatorDelta } from '../types/validator-delta.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { buildInitialSheet } from '../build-initial-sheet.js';
import { applyValidatorDelta } from '../patch-delta.js';
import { runValidation } from '../runner/run-validation.js';
import { getValidatorGetters } from '../worker/worker-registry.js';

export interface ValidatorWorkerOptions {
  signal?: AbortSignal;
}

export function useValidatorWorker() {
  const { dispatchProgress, setResult, layout, setPhaseTiming } = useImporterContext();

  const validate = useCallback(
    async (
      sanitizedSheet: SanitizedSheet,
      sheetLayout: SheetLayout,
      options?: ValidatorWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void
    ): Promise<ValidatorDelta> => {
      const progressCb = onProgress ?? dispatchProgress;
      const getters = getValidatorGetters();
      return runValidation(sanitizedSheet, sheetLayout, getters, progressCb, options?.signal);
    },
    [dispatchProgress]
  );

  const validateAndApply = useCallback(
    async (
      sanitizedSheet: SanitizedSheet,
      options?: ValidatorWorkerOptions,
      onProgress?: (d: ImporterProgressDetail) => void
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
    [layout, validate, setResult, setPhaseTiming]
  );

  return { validate, validateAndApply, dispatchProgress, isReady: true };
}
