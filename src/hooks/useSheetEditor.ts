import { useCallback, useMemo, useRef } from 'react';
import { type ChangeLogEntry, formatChangeLogAsText } from '../types/change-log.js';
import type { EditCellParams } from '../types/edit.js';
import type { PaginatedResult } from '../types/paginated-result.js';
import type { ValidatedRow } from '../types/sheet.js';
import { useImporterContext } from '../providers/index.js';
import { removeRow as removeRowSheet } from '../core/editor/immutable-update.js';
import { useEditWorker } from '../core/editor/hooks/useEditWorker.js';
import { getPaginatedResult } from '../core/editor/get-paginated-result.js';
import { getCellByKey, getRowByIndex } from '../core/editor/resolve.js';

export interface UseSheetEditorOptions {
  page?: number;
  pageSize?: number;
  debounceMs?: number;
}

export function useSheetEditor(options: UseSheetEditorOptions = {}) {
  const {
    result: sheet,
    setResult,
    layout,
    changeLog,
    addChangeLogEntry,
    submitDone,
  } = useImporterContext();
  const { runEdit, isReady } = useEditWorker();
  const canEdit = !submitDone;
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
      if (!sheet || !layout || submitDone) return Promise.resolve();
      const previousValue =
        getRowByIndex(sheet, params.rowIndex) &&
        getCellByKey(getRowByIndex(sheet, params.rowIndex)!, params.cellKey)?.value;
      return runEdit(sheet, layout, params.rowIndex, params.cellKey, params.value).then(
        (newSheet) => {
          setResult(newSheet);
          queueMicrotask(() => {
            const entry: ChangeLogEntry = {
              type: 'cell_edit',
              rowIndex: params.rowIndex,
              cellKey: params.cellKey,
              value: params.value,
              previousValue,
              timestamp: Date.now(),
            };
            addChangeLogEntry(entry);
          });
        }
      );
    },
    [sheet, layout, submitDone, runEdit, setResult, addChangeLogEntry]
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
    [debounceMs, applyEdit]
  );

  const removeRow = useCallback(
    (rowIndex: number): void => {
      if (!sheet || submitDone) return;
      const newSheet = removeRowSheet(sheet, rowIndex);
      setResult(newSheet);
      queueMicrotask(() => {
        const entry: ChangeLogEntry = {
          type: 'row_remove',
          rowIndex,
          timestamp: Date.now(),
        };
        addChangeLogEntry(entry);
      });
    },
    [sheet, submitDone, setResult, addChangeLogEntry]
  );

  const changeLogAsText = useMemo(() => formatChangeLogAsText(changeLog), [changeLog]);

  return useMemo(
    () => ({
      sheet,
      editCell,
      removeRow,
      pageData,
      totalPages,
      isReady,
      canEdit,
      changeLog,
      changeLogAsText,
    }),
    [sheet, editCell, removeRow, pageData, totalPages, isReady, canEdit, changeLog, changeLogAsText]
  );
}
