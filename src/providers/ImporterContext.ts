import { createContext } from 'react';
import type { ImporterContextValue } from './types.js';

export const ImporterContext = createContext<ImporterContextValue | null>(null);
