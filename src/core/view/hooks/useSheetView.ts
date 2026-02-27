import { useCallback, useMemo, useState } from 'react';
import type { ValidatedRow } from '../../../types/sheet.js';
import { useImporterContext } from '../../../providers/index.js';
import { useSheetEditor } from '../../../hooks/useSheetEditor.js';
import { getPaginatedResultFromRows } from '../../editor/get-paginated-result.js';
import { getRowsWithErrors } from '../get-rows-with-errors.js';
import { getViewCounts } from '../get-view-counts.js';
import { sheetToCSV } from '../export/sheet-to-csv.js';
import { sheetToJSON } from '../export/sheet-to-json.js';
import type { UseSheetViewOptions, UseSheetViewReturn } from '../types/index.js';

export function useSheetView(
  options: UseSheetViewOptions = {},
): UseSheetViewReturn<ValidatedRow> {
  const {
    page: initialPage = 1,
    defaultPageSize = 25,
    filterMode = 'all',
  } = options;
  const [page, setPage] = useState(initialPage);
  const pageSize = defaultPageSize;
  const { sheet, editCell } = useSheetEditor({});
  const ctx = useImporterContext();

  const rowsWithErrors = useMemo(
    () => (sheet ? getRowsWithErrors(sheet) : []),
    [sheet],
  );
  const sourceRows = useMemo(
    () =>
      filterMode === 'errors-only' ? rowsWithErrors : (sheet?.rows ?? []),
    [filterMode, rowsWithErrors, sheet],
  );
  const totalRows = sourceRows.length;

  const getPaginatedResult = useCallback(
    (p?: number, ps?: number) => {
      const pp = p ?? page;
      const pps = ps ?? pageSize;
      return getPaginatedResultFromRows(sourceRows, pp, pps);
    },
    [page, pageSize, sourceRows],
  );
  const paginatedRows = useMemo(
    () => getPaginatedResult(page, pageSize).rows,
    [getPaginatedResult, page, pageSize],
  );
  const getRows = useCallback(
    (offset: number, limit: number) =>
      sourceRows.slice(offset, offset + limit),
    [sourceRows],
  );
  const counts = useMemo(
    () =>
      sheet
        ? getViewCounts(sheet)
        : { totalRows: 0, rowsWithErrors: 0, totalErrors: 0 },
    [sheet],
  );

  const exportToCSV = useCallback(
    (opts?: Parameters<UseSheetViewReturn['exportToCSV']>[0]) => {
      if (!sheet || !ctx.layout) return '';
      return sheetToCSV(sheet, ctx.layout, opts ?? {});
    },
    [sheet, ctx.layout],
  );
  const exportToJSON = useCallback(
    (opts?: Parameters<UseSheetViewReturn['exportToJSON']>[0]) => {
      if (!sheet) return '[]';
      return sheetToJSON(sheet, ctx.layout ?? null, opts ?? {});
    },
    [sheet, ctx.layout],
  );

  const downloadCSV = useCallback(
    async (opts?: Parameters<UseSheetViewReturn['downloadCSV']>[0]) => {
      const content = exportToCSV(opts);
      if (!content) return;
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (opts?.filename ?? 'export') + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    [exportToCSV],
  );
  const downloadJSON = useCallback(
    async (opts?: Parameters<UseSheetViewReturn['downloadJSON']>[0]) => {
      const content = exportToJSON(opts);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (opts?.filename ?? 'export') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    [exportToJSON],
  );

  return useMemo(
    () => ({
      sheet,
      getPaginatedResult,
      paginatedRows,
      page,
      setPage,
      pageSize,
      totalRows,
      getRows,
      rowsWithErrors,
      counts,
      editCell,
      exportToCSV,
      exportToJSON,
      downloadCSV,
      downloadJSON,
      hasRecoverableSession: ctx.hasRecoverableSession,
      recoverSession: ctx.recoverSession,
      clearPersistedState: ctx.clearPersistedState,
    }),
    [
      sheet,
      getPaginatedResult,
      paginatedRows,
      page,
      pageSize,
      totalRows,
      getRows,
      rowsWithErrors,
      counts,
      editCell,
      exportToCSV,
      exportToJSON,
      downloadCSV,
      downloadJSON,
      ctx.hasRecoverableSession,
      ctx.recoverSession,
      ctx.clearPersistedState,
    ],
  );
}
