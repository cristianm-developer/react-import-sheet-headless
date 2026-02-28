import type { ChangeLogEntry } from '../../../types/change-log.js';
import type { EditCellParams } from '../../../types/edit.js';
import type { PaginatedResult } from '../../../types/paginated-result.js';
import type { Sheet, ValidatedRow } from '../../../types/sheet.js';
import type { ExportOptions } from './export-options.js';
import type { ViewCounts } from './view-counts.js';

export interface UseSheetViewReturn<TRow = ValidatedRow> {
  sheet: Sheet | null;
  getPaginatedResult: (page?: number, pageSize?: number) => PaginatedResult<TRow>;
  paginatedRows: readonly TRow[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalRows: number;
  /** 1-based page; returns slice for that page. */
  getRows: (page: number, limit: number) => TRow[];
  rowsWithErrors: readonly TRow[];
  counts: ViewCounts;
  editCell: (params: EditCellParams) => void | Promise<void>;
  removeRow: (rowIndex: number) => void;
  changeLog: readonly ChangeLogEntry[];
  changeLogAsText: string;
  exportToCSV: (options?: ExportOptions) => string | Blob | Promise<string | Blob>;
  exportToJSON: (options?: ExportOptions) => string | Blob | Promise<string | Blob>;
  downloadCSV: (options?: ExportOptions & { filename?: string }) => void | Promise<void>;
  downloadJSON: (options?: ExportOptions & { filename?: string }) => void | Promise<void>;
  hasRecoverableSession: boolean;
  recoverSession: () => Promise<void>;
  clearPersistedState: () => Promise<void>;
}
