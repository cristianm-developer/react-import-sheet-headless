import type { ConvertedSheet } from './converted-sheet.js';

export interface ConvertSuccess {
  readonly kind: 'success';
  readonly sheet: ConvertedSheet;
}
