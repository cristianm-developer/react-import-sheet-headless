export interface ColumnMismatch {
  readonly expected: string;
  readonly found: string | null;
  readonly message?: string;
  readonly required?: boolean;
}
