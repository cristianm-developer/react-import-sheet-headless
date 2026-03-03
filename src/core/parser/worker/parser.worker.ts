import * as Comlink from 'comlink';
import type { RawParseResult } from '../../../types/raw-sheet.js';
import type { ParseOptions } from '../types/index.js';
import { parseSheet } from '../adapter.js';

type ProgressCallback = (detail: {
  phase?: string;
  localPercent?: number;
  currentRow?: number;
  totalRows?: number;
}) => void;

let storedBlob: Blob | null = null;
let storedOptions: ParseOptions = {};

const api = {
  async load(blob: Blob, options: ParseOptions = {}): Promise<RawParseResult> {
    storedBlob = blob;
    storedOptions = { ...options };
    const previewOptions: ParseOptions = { ...options, maxRows: options.maxRows ?? 10 };
    const result = await parseSheet(blob, previewOptions);
    return structuredClone(result);
  },

  async parseAll(onProgress?: ProgressCallback): Promise<RawParseResult> {
    if (!storedBlob) throw new Error('No file loaded. Call load(blob, options) first.');
    const fullOptions: ParseOptions = { ...storedOptions, maxRows: undefined };
    if (onProgress) onProgress({ phase: 'parsing', localPercent: 0 });
    const result = await parseSheet(storedBlob, fullOptions);
    if (onProgress) onProgress({ phase: 'parsing', localPercent: 100 });
    return structuredClone(result);
  },
};

Comlink.expose(api);
