import { useCallback, useMemo } from 'react';
import { useImporterContext } from '../../../providers/index.js';
import { runConvert } from '../run-convert.js';
import type { ConvertOptions } from '../types/convert-options.js';
import type { ConvertResult, ConvertResultApplyResult } from '../types/convert-result.js';

export function useConvert() {
  const ctx = useImporterContext();
  const { rawData, layout, convertedSheet, convertResultData, setConvertedSheet, setConvertResultData } = ctx;

  const convert = useCallback(
    (options?: ConvertOptions) => {
      if (!rawData || !layout) return;
      const result = runConvert(rawData, layout, options, convertResultData ?? undefined);
      if (result.kind === 'success') {
        setConvertedSheet(result.sheet);
      } else {
        setConvertResultData({
          headersFound: result.headersFound,
          mismatches: result.mismatches,
          columnOrder: result.columnOrder,
          headerToFieldMap: result.headerToFieldMap,
        });
      }
    },
    [rawData, layout, convertResultData, setConvertedSheet, setConvertResultData],
  );

  const applyMappingImpl = useCallback((): ConvertResultApplyResult | undefined => {
    if (!rawData || !layout || !convertResultData) return undefined;
    const result = runConvert(rawData, layout, {}, {
      columnOrder: convertResultData.columnOrder,
      headerToFieldMap: convertResultData.headerToFieldMap,
    });
    if (result.kind === 'success') {
      setConvertedSheet(result.sheet);
      return { kind: 'success', sheet: result.sheet };
    }
    setConvertResultData({
      headersFound: result.headersFound,
      mismatches: result.mismatches,
      columnOrder: result.columnOrder,
      headerToFieldMap: result.headerToFieldMap,
    });
    return { kind: 'mismatch', result };
  }, [rawData, layout, convertResultData, setConvertedSheet, setConvertResultData]);

  const reorderColumns = useCallback(
    (fieldNames: string[]) => {
      setConvertResultData((prev) =>
        prev ? { ...prev, columnOrder: fieldNames } : prev,
      );
    },
    [setConvertResultData],
  );

  const renameColumn = useCallback(
    (fileHeader: string, layoutFieldName: string) => {
      setConvertResultData((prev) =>
        prev
          ? {
              ...prev,
              headerToFieldMap: { ...prev.headerToFieldMap, [fileHeader]: layoutFieldName },
            }
          : prev,
      );
    },
    [setConvertResultData],
  );

  const convertResult: ConvertResult | null = useMemo(() => {
    if (!convertResultData) return null;
    return {
      kind: 'mismatch',
      headersFound: convertResultData.headersFound,
      mismatches: convertResultData.mismatches,
      columnOrder: [...convertResultData.columnOrder],
      headerToFieldMap: { ...convertResultData.headerToFieldMap },
      reorderColumns,
      renameColumn,
      applyMapping: () =>
        applyMappingImpl() ?? {
          kind: 'mismatch' as const,
          result: { ...convertResultData, kind: 'mismatch' as const },
        },
    };
  }, [convertResultData, reorderColumns, renameColumn, applyMappingImpl]);

  return useMemo(
    () => ({
      convert,
      convertedSheet,
      convertResult,
    }),
    [convert, convertedSheet, convertResult],
  );
}
