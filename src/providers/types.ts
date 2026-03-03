import type { ReactNode } from 'react';
import type { Registry } from '../shared/registry/index.js';
import type { RegistryLevel } from '../shared/registry/index.js';
import type { ParserEngine, SheetLayout } from '../types/index.js';
import type { ChangeLogEntry } from '../types/change-log.js';
import type {
  ImporterState,
  ImporterStatus,
  PipelineMetricsTimings,
  PipelinePhase,
} from '../types/index.js';
import type { ImporterProgressDetail } from '../types/index.js';

export interface ImporterContextValue {
  readonly file: File | null;
  readonly rawData: ImporterState['rawData'];
  readonly documentHash: string | null;
  readonly status: ImporterStatus;
  readonly result: ImporterState['result'];
  readonly convertedSheet: ImporterState['convertedSheet'];
  readonly sanitizedSheet: ImporterState['sanitizedSheet'];
  readonly convertResultData: ImporterState['convertResultData'];
  readonly metrics: ImporterState['metrics'];
  readonly changeLog: ImporterState['changeLog'];
  readonly submitDone: boolean;
  readonly layout: SheetLayout | null;
  readonly engine: ParserEngine | null;
  readonly progressEventTarget: EventTarget;
  onSubmit: ((rows: Record<string, unknown>[]) => void) | null;
  submitKeyMap: Readonly<Record<string, string>> | null;
  addChangeLogEntry: (entry: ChangeLogEntry) => void;
  setLayout: (layout: SheetLayout | null) => void;
  setEngine: (engine: ParserEngine | null) => void;
  setFile: (file: File | null) => void;
  setRawData: (rawData: ImporterState['rawData']) => void;
  setDocumentHash: (documentHash: string | null) => void;
  setStatus: (status: ImporterStatus) => void;
  setResult: (result: ImporterState['result']) => void;
  setConvertedSheet: (sheet: ImporterState['convertedSheet']) => void;
  setSanitizedSheet: (sheet: ImporterState['sanitizedSheet']) => void;
  setConvertResultData: (
    data:
      | ImporterState['convertResultData']
      | ((prev: ImporterState['convertResultData']) => ImporterState['convertResultData'])
  ) => void;
  setMetrics: (metrics: ImporterState['metrics']) => void;
  setSubmitDone: (done: boolean) => void;
  setPhaseTiming: (phase: PipelinePhase, ms: number) => void;
  finalizeMetrics: (rowCount: number) => void;
  processFile: (file: File) => void;
  registerValidator: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel }
  ) => void;
  registerSanitizer: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel }
  ) => void;
  registerTransform: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel }
  ) => void;
  abort: () => void;
  dispatchProgress: (detail: ImporterProgressDetail) => void;
  setActiveWorker: (worker: Worker | null) => void;
  persist: boolean;
  persistKey: string;
  hasRecoverableSession: boolean;
  recoverSession: () => Promise<void>;
  clearPersistedState: () => Promise<void>;
}

export interface ImporterProviderProps {
  children: ReactNode;
  layout?: SheetLayout | null;
  engine?: ParserEngine | null;
  persist?: boolean;
  persistKey?: string;
  onSubmit?: ((rows: Record<string, unknown>[]) => void) | null;
  submitKeyMap?: Readonly<Record<string, string>> | null;
}

export interface UseImporterStateSettersDeps {
  setState: React.Dispatch<React.SetStateAction<ImporterState>>;
  setLayoutState: React.Dispatch<React.SetStateAction<SheetLayout | null>>;
  setEngineState: React.Dispatch<React.SetStateAction<ParserEngine | null>>;
}

export interface UseImporterActionsDeps {
  setState: React.Dispatch<React.SetStateAction<ImporterState>>;
  setLayoutState: React.Dispatch<React.SetStateAction<SheetLayout | null>>;
  setEngineState: React.Dispatch<React.SetStateAction<ParserEngine | null>>;
  progressEventTarget: EventTarget;
  validatorRegistry: Registry<(...args: unknown[]) => unknown>;
  sanitizerRegistry: Registry<(...args: unknown[]) => unknown>;
  transformRegistry: Registry<(...args: unknown[]) => unknown>;
  activeWorkerRef: React.MutableRefObject<Worker | null>;
  phaseTimingsRef: React.MutableRefObject<PipelineMetricsTimings>;
}
