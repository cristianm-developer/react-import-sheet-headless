import { useContext } from 'react';
import { ImporterContext } from './ImporterContext.js';
import type { ImporterContextValue } from './types.js';

export function useImporterContext(): ImporterContextValue {
  const context = useContext(ImporterContext);
  if (context === null) {
    throw new Error('useImporter must be used within an ImporterProvider');
  }
  return context;
}
