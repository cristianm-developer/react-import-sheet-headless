import { useCallback } from 'react';
import type { ConvertedSheet } from '../../convert/types/converted-sheet.js';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../types/sanitized-sheet.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { runSanitization } from '../runner/run-sanitization.js';
import { getSanitizerGetters } from '../worker/worker-registry.js';

export function useSanitizerWorker() {
  const { dispatchProgress, setPhaseTiming } = useImporterContext();

  const sanitize = useCallback(
    async (
      convertedSheet: ConvertedSheet,
      sheetLayout: SheetLayout,
      _options?: Record<string, unknown>,
      onProgress?: (d: ImporterProgressDetail) => void
    ): Promise<SanitizedSheet> => {
      const progressCb = onProgress ?? dispatchProgress;
      const t0 = performance.now();
      const getters = getSanitizerGetters();
      const result = await runSanitization(convertedSheet, sheetLayout, getters, progressCb);
      const t1 = performance.now();
      setPhaseTiming('sanitize', t1 - t0);
      return result;
    },
    [dispatchProgress, setPhaseTiming]
  );

  return { sanitize, dispatchProgress, isReady: true };
}
