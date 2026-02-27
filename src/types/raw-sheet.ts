export interface RawSheetCell {
  readonly key: string;
  readonly value: unknown;
}

export interface RawSheetRow {
  readonly index: number;
  readonly cells: readonly RawSheetCell[];
}

export interface BaseSheet<TRow> {
  readonly name: string;
  readonly filesize: number;
  readonly rowsCount?: number;
  readonly headersCount?: number;
  readonly headers: readonly string[];
  readonly rows: readonly TRow[];
}

export type RawSheet = BaseSheet<RawSheetRow>;
