export interface PaginatedResult<TRow> {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly rows: readonly TRow[];
}
