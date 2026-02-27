export type RawSheetCellValue = string | number | boolean | Date | null;

export interface RawSheetCell {
  readonly key: string;
  readonly value: RawSheetCellValue;
}

export interface RawSheetRow {
  readonly index: number;
  readonly cells: readonly RawSheetCell[];
}

export interface BaseSheet<TRow> {
  readonly name: string;
  readonly filesize: number;
  readonly documentHash: string;
  readonly rowsCount?: number;
  readonly headersCount?: number;
  readonly headers: readonly string[];
  readonly rows: readonly TRow[];
}

export interface RawParseResult {
  readonly sheets: Readonly<Record<string, RawSheet>>;
  readonly parserMeta?: Readonly<{ encoding?: string; delimiter?: string }>;
}

export type RawSheet = BaseSheet<RawSheetRow>;
