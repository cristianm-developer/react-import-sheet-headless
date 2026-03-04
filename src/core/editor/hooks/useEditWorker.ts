import { useCallback } from 'react';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import { runEditPipeline } from '../run-edit-pipeline.js';
import { getValidatorGetters } from '../../validator/worker/worker-registry.js';
import { getTransformGetters } from '../../transform/worker/worker-registry.js';

export interface EditWorkerOptions {
  signal?: AbortSignal;
}

export function useEditWorker() {
  const runEdit = useCallback(
    async (
      sheet: Sheet,
      sheetLayout: SheetLayout,
      rowIndex: number,
      cellKey: string,
      value: unknown,
      options?: EditWorkerOptions
    ): Promise<Sheet> => {
      const validator = getValidatorGetters();
      const transform = getTransformGetters();
      return runEditPipeline(
        sheet,
        sheetLayout,
        rowIndex,
        cellKey,
        value,
        { validator, transform },
        options?.signal
      );
    },
    []
  );

  return { runEdit, isReady: true };
}
