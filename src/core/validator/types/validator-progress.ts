export interface ValidatorProgressDetail {
  readonly phase?: string;
  readonly globalPercent?: number;
  readonly localPercent?: number;
  readonly currentRow?: number;
  readonly totalRows?: number;
}
