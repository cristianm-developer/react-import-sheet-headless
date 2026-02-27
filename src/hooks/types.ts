import type { ParserEngine, SheetLayout } from '../types/index.js';

export interface UseImporterOptions {
  layout?: SheetLayout | null;
  engine?: ParserEngine | null;
}
