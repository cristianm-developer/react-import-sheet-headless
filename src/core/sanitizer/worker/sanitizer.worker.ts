import * as Comlink from 'comlink';
import type { ConvertedSheet } from '../../convert/types/converted-sheet.js';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { SanitizedSheet } from '../types/sanitized-sheet.js';
import type { SanitizerProgressDetail } from '../types/sanitizer-progress.js';
import { runSanitization } from '../runner/run-sanitization.js';
import { getSanitizerGetters } from './worker-registry.js';

type ProgressCallback = (detail: SanitizerProgressDetail) => void;

const api = {
  async sanitize(
    convertedSheet: ConvertedSheet,
    sheetLayout: SheetLayout,
    _options?: Record<string, unknown>,
    onProgress?: ProgressCallback,
  ): Promise<SanitizedSheet> {
    const getters = getSanitizerGetters();
    return runSanitization(convertedSheet, sheetLayout, getters, onProgress);
  },
};

Comlink.expose(api);
