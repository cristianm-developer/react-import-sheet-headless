import { useCallback } from 'react';
import type { ImporterState, ImporterStatus } from '../types/index.js';
import type { SheetLayout } from '../types/index.js';
import type { ImporterContextValue, UseImporterStateSettersDeps } from './types.js';

export function useImporterStateSetters(
  deps: UseImporterStateSettersDeps,
): Pick<
  ImporterContextValue,
  'setLayout' | 'setFile' | 'setRawData' | 'setDocumentHash' | 'setStatus' | 'setResult'
> {
  const { setState, setLayoutState } = deps;

  const setFile = useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, file }));
  }, [setState]);

  const setRawData = useCallback((rawData: ImporterState['rawData']) => {
    setState((prev) => ({ ...prev, rawData }));
  }, [setState]);

  const setDocumentHash = useCallback((documentHash: string | null) => {
    setState((prev) => ({ ...prev, documentHash }));
  }, [setState]);

  const setStatus = useCallback((status: ImporterStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, [setState]);

  const setResult = useCallback((result: ImporterState['result']) => {
    setState((prev) => ({ ...prev, result }));
  }, [setState]);

  const setLayout = useCallback((next: SheetLayout | null) => {
    setLayoutState(next);
  }, [setLayoutState]);

  return {
    setLayout,
    setFile,
    setRawData,
    setDocumentHash,
    setStatus,
    setResult,
  };
}
