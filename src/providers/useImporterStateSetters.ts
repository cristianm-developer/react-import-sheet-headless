import { useCallback } from 'react';
import type { ImporterState, ImporterStatus } from '../types/index.js';
import type { ParserEngine, SheetLayout } from '../types/index.js';
import type { ImporterContextValue, UseImporterStateSettersDeps } from './types.js';

export function useImporterStateSetters(
  deps: UseImporterStateSettersDeps,
):   Pick<
  ImporterContextValue,
  | 'setLayout'
  | 'setEngine'
  | 'setFile'
  | 'setRawData'
  | 'setDocumentHash'
  | 'setStatus'
  | 'setResult'
  | 'setConvertedSheet'
  | 'setSanitizedSheet'
  | 'setConvertResultData'
> {
  const { setState, setLayoutState, setEngineState } = deps;

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

  const setConvertedSheet = useCallback((convertedSheet: ImporterState['convertedSheet']) => {
    setState((prev) => ({ ...prev, convertedSheet, convertResultData: null }));
  }, [setState]);

  const setSanitizedSheet = useCallback((sanitizedSheet: ImporterState['sanitizedSheet']) => {
    setState((prev) => ({ ...prev, sanitizedSheet }));
  }, [setState]);

  const setConvertResultData = useCallback(
    (
      dataOrUpdater:
        | ImporterState['convertResultData']
        | ((prev: ImporterState['convertResultData']) => ImporterState['convertResultData']),
    ) => {
      setState((prev) => ({
        ...prev,
        convertResultData:
          typeof dataOrUpdater === 'function' ? dataOrUpdater(prev.convertResultData) : dataOrUpdater,
        convertedSheet: typeof dataOrUpdater === 'function' ? prev.convertedSheet : null,
      }));
    },
    [setState],
  );

  const setLayout = useCallback((next: SheetLayout | null) => {
    setLayoutState(next);
  }, [setLayoutState]);

  const setEngine = useCallback((next: ParserEngine | null) => {
    setEngineState(next);
  }, [setEngineState]);

  return {
    setLayout,
    setEngine,
    setFile,
    setRawData,
    setDocumentHash,
    setStatus,
    setResult,
    setConvertedSheet,
    setSanitizedSheet,
    setConvertResultData,
  };
}
