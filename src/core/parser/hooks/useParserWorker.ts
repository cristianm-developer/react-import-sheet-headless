import { useCallback, useRef } from 'react';
import type { RawParseResult } from '../../../types/raw-sheet.js';
import type { ParseOptions } from '../types/index.js';
import type { ImporterProgressDetail } from '../../../types/importer-state.js';
import { useImporterContext } from '../../../providers/index.js';
import { parseSheet } from '../adapter.js';

export function useParserWorker() {
  const { dispatchProgress } = useImporterContext();
  const storedBlobRef = useRef<Blob | null>(null);
  const storedOptionsRef = useRef<ParseOptions>({});

  const load = useCallback(
    async (blob: Blob, options: ParseOptions = {}): Promise<RawParseResult> => {
      storedBlobRef.current = blob;
      storedOptionsRef.current = { ...options };
      const previewOptions: ParseOptions = { ...options, maxRows: options.maxRows ?? 10 };
      return parseSheet(blob, previewOptions);
    },
    []
  );

  const parseAll = useCallback(
    async (onProgress?: (d: ImporterProgressDetail) => void): Promise<RawParseResult> => {
      if (!storedBlobRef.current) {
        throw new Error('No file loaded. Call load(blob, options) first.');
      }
      const fullOptions: ParseOptions = { ...storedOptionsRef.current, maxRows: undefined };
      if (onProgress) onProgress({ phase: 'parsing', localPercent: 0 });
      const result = await parseSheet(storedBlobRef.current, fullOptions);
      if (onProgress) onProgress({ phase: 'parsing', localPercent: 100 });
      return result;
    },
    []
  );

  return { load, parseAll, dispatchProgress, isReady: true };
}
