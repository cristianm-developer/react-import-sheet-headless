export type SheetErrorLevel = 'error' | 'warning' | 'fatal' | 'info';

export interface SheetError {
  readonly code: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly level?: SheetErrorLevel;
  readonly message?: string;
  readonly rowIndex?: number;
  readonly cellKey?: string;
}
