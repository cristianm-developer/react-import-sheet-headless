export interface ConvertOptions {
  readonly caseSensitive?: boolean;
  readonly normalizer?: (header: string) => string;
}
