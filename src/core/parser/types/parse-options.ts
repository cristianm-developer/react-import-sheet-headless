import type { ParserEngine } from '../../../types/parser-engine.js';

export interface ParseOptions {
  readonly maxRows?: number;
  readonly fileName?: string;
  readonly delimiterOverride?: string;
  readonly encodingOverride?: string;
  readonly engine?: ParserEngine | null;
}
