import { useCallback, useMemo, useRef } from 'react';
import type { EditCellParams } from '../types/edit.js';
import type { PaginatedResult } from '../types/paginated-result.js';
import type { ValidatedRow } from '../types/sheet.js';
import { useImporterContext } from '../providers/index.js';
import { useEditWorker } from '../core/editor/hooks/useEditWorker.js';
import { getPaginatedResult } from '../core/editor/get-paginated-result.js';

export interface UseSheetEditorOptions {
  page?: number;
  pageSize?: number;
  debounceMs?: number;
}

export function useSheetEditor(options: UseSheetEditorOptions = {}) {
  const { result: sheet, setResult, layout } = useImporterContext();
  const { runEdit, isReady } = useEditWorker();
  const { page = 1, pageSize = 25, debounceMs } = options;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageData = useMemo((): PaginatedResult<ValidatedRow> => {
    if (!sheet) {
      return { page: 1, pageSize, totalCount: 0, totalPages: 0, rows: [] };
    }
    return getPaginatedResult(sheet, page, pageSize);
  }, [sheet, page, pageSize]);

  const totalPages = pageData.totalPages;

  const applyEdit = useCallback(
    (params: EditCellParams) => {
      if (!sheet || !layout) return Promise.resolve();
      return runEdit(
        sheet,
        layout,
        params.rowIndex,
        params.cellKey,
        params.value,
      ).then(setResult);
    },
    [sheet, layout, runEdit, setResult],
  );

  const editCell = useCallback(
    (params: EditCellParams): void | Promise<void> => {
      if (debounceMs != null && debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          applyEdit(params);
        }, debounceMs);
        return;
      }
      return applyEdit(params);
    },
    [debounceMs, applyEdit],
  );

  return useMemo(
    () => ({
      sheet,
      editCell,
      pageData,
      totalPages,
      isReady,
    }),
    [sheet, editCell, pageData, totalPages, isReady],
  );
}
