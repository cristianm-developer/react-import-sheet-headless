import { useCallback, useMemo } from 'react';
import type { ValidatedRow } from '../types/sheet.js';
import { useImporterContext } from '../providers/index.js';
import {
  sheetRowsToObjects,
  sheetToObjectsWithKeyMap,
} from '../core/view/export/sheet-to-objects.js';

export function useSheetData() {
  const ctx = useImporterContext();
  const sheet = ctx.result;
  const errors = useMemo(() => {
    const sheetErrors = sheet ? [...sheet.errors] : [];
    const globalErrors = [...ctx.globalErrors];
    return [...globalErrors, ...sheetErrors];
  }, [sheet, ctx.globalErrors]);
  const toObjects = useCallback(
    <T>(mapRow: (row: ValidatedRow) => T): T[] => {
      if (!sheet) return [];
      return sheetRowsToObjects(sheet.rows, mapRow);
    },
    [sheet]
  );
  const toObjectsWithKeyMap = useCallback(
    (keyMap: Readonly<Record<string, string>>): Record<string, unknown>[] => {
      return sheetToObjectsWithKeyMap(sheet, keyMap);
    },
    [sheet]
  );
  return useMemo(
    () => ({ sheet, errors, toObjects, toObjectsWithKeyMap }),
    [sheet, errors, toObjects, toObjectsWithKeyMap]
  );
}
