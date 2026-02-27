import * as Comlink from 'comlink';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../../sanitizer/types/sanitized-sheet.js';
import type { ValidatorDelta } from '../types/validator-delta.js';
import type { ValidatorProgressDetail } from '../types/validator-progress.js';
import { runValidation } from '../runner/run-validation.js';
import { getValidatorGetters } from './worker-registry.js';

type ProgressCallback = (detail: ValidatorProgressDetail) => void;

export interface ValidatorWorkerOptions {
  signal?: AbortSignal;
}

const api = {
  async validate(
    sanitizedSheet: SanitizedSheet,
    sheetLayout: SheetLayout,
    options?: ValidatorWorkerOptions,
    onProgress?: ProgressCallback,
  ): Promise<ValidatorDelta> {
    const getters = getValidatorGetters();
    return runValidation(
      sanitizedSheet,
      sheetLayout,
      getters,
      onProgress,
      options?.signal,
    );
  },
};

Comlink.expose(api);
