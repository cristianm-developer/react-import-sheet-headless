import type { ImporterState } from '../types/index.js';

export const initialState: ImporterState = {
  file: null,
  rawData: null,
  documentHash: null,
  status: 'idle',
  result: null,
  convertedSheet: null,
  convertResultData: null,
};
