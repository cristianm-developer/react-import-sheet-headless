import type { ReactNode } from 'react';
import type { Registry } from '../shared/registry/index.js';
import type { RegistryLevel } from '../shared/registry/index.js';
import type { SheetLayout } from '../types/index.js';
import type { ImporterState, ImporterStatus } from '../types/index.js';
import type { ImporterProgressDetail } from '../types/index.js';

export interface ImporterContextValue {
  readonly file: File | null;
  readonly rawData: ImporterState['rawData'];
  readonly documentHash: string | null;
  readonly status: ImporterStatus;
  readonly result: ImporterState['result'];
  readonly layout: SheetLayout | null;
  readonly progressEventTarget: EventTarget;
  setLayout: (layout: SheetLayout | null) => void;
  setFile: (file: File | null) => void;
  setRawData: (rawData: ImporterState['rawData']) => void;
  setDocumentHash: (documentHash: string | null) => void;
  setStatus: (status: ImporterStatus) => void;
  setResult: (result: ImporterState['result']) => void;
  processFile: (file: File) => void;
  registerValidator: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel },
  ) => void;
  registerSanitizer: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel },
  ) => void;
  registerTransform: (
    name: string,
    fn: (...args: unknown[]) => unknown,
    options: { type: RegistryLevel },
  ) => void;
  abort: () => void;
  dispatchProgress: (detail: ImporterProgressDetail) => void;
  setActiveWorker: (worker: Worker | null) => void;
}

export interface ImporterProviderProps {
  children: ReactNode;
  layout?: SheetLayout | null;
}

export interface UseImporterStateSettersDeps {
  setState: React.Dispatch<React.SetStateAction<ImporterState>>;
  setLayoutState: React.Dispatch<React.SetStateAction<SheetLayout | null>>;
}

export interface UseImporterActionsDeps {
  setState: React.Dispatch<React.SetStateAction<ImporterState>>;
  setLayoutState: React.Dispatch<React.SetStateAction<SheetLayout | null>>;
  progressEventTarget: EventTarget;
  validatorRegistry: Registry<(...args: unknown[]) => unknown>;
  sanitizerRegistry: Registry<(...args: unknown[]) => unknown>;
  transformRegistry: Registry<(...args: unknown[]) => unknown>;
  activeWorkerRef: React.MutableRefObject<Worker | null>;
}
