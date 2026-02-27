import type { PaginatedResult } from '../../types/paginated-result.js';
import type { Sheet, ValidatedRow } from '../../types/sheet.js';

export function getPaginatedResult(
  sheet: Sheet,
  page: number,
  pageSize: number,
): PaginatedResult<ValidatedRow> {
  return getPaginatedResultFromRows(sheet.rows, page, pageSize);
}

export function getPaginatedResultFromRows<TRow>(
  rows: readonly TRow[],
  page: number,
  pageSize: number,
): PaginatedResult<TRow> {
  const totalCount = rows.length;
  const totalPages =
    pageSize <= 0 ? 0 : Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, totalCount);
  const slice = rows.slice(start, end);
  return {
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
    rows: slice,
  };
}
