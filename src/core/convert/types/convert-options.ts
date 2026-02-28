export interface ConvertOptions {
  readonly caseSensitive?: boolean;
  readonly normalizer?: (header: string) => string;
  readonly fuzzyHeaders?: boolean;
  readonly fuzzyThreshold?: number;
}
