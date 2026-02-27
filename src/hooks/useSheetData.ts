import { useMemo } from 'react';
import { useImporterContext } from '../providers/index.js';

export function useSheetData() {
  const ctx = useImporterContext();
  const sheet = ctx.result;
  const errors = useMemo(() => {
    if (!sheet) return [];
    return [...sheet.errors];
  }, [sheet]);
  return useMemo(() => ({ sheet, errors }), [sheet, errors]);
}
