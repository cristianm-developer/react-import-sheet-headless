import { useCallback, useMemo } from 'react';
import { useImporterContext } from '../providers/index.js';

export function useSheetEditor() {
  useImporterContext();
  const editCell = useCallback(
    (_rowIndex: number, _cellKey: string, _value: unknown): Promise<void> =>
      Promise.resolve(),
    [],
  );
  return useMemo(() => ({ editCell }), [editCell]);
}
