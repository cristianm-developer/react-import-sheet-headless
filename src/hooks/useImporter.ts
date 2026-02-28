import { useCallback, useEffect, useMemo } from 'react';
import { useImporterContext } from '../providers/index.js';
import { hasValidationErrors } from '../core/view/get-view-counts.js';
import { sheetToObjectsWithKeyMap } from '../core/view/export/sheet-to-objects.js';
import type { Sheet } from '../types/sheet.js';
import type { UseImporterOptions } from './types.js';

function rowsToLayoutObjects(sheet: Sheet): Record<string, unknown>[] {
  return sheet.rows.map((row) =>
    row.cells.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, unknown>)
  );
}

export function useImporter(options: UseImporterOptions = {}) {
  const ctx = useImporterContext();
  const { layout: layoutOption, engine: engineOption } = options;

  useEffect(() => {
    if (layoutOption !== undefined) {
      ctx.setLayout(layoutOption);
    }
  }, [ctx, layoutOption]);

  useEffect(() => {
    if (engineOption !== undefined) {
      ctx.setEngine(engineOption);
    }
  }, [ctx, engineOption]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        ctx.result &&
        ctx.status === 'success' &&
        !ctx.submitDone &&
        !hasValidationErrors(ctx.result)
      ),
    [ctx.result, ctx.status, ctx.submitDone]
  );

  const submit = useCallback(() => {
    if (!ctx.result || ctx.submitDone || hasValidationErrors(ctx.result) || !ctx.onSubmit) return;
    const data = ctx.submitKeyMap
      ? sheetToObjectsWithKeyMap(ctx.result, ctx.submitKeyMap)
      : rowsToLayoutObjects(ctx.result);
    ctx.onSubmit(data);
    ctx.setSubmitDone(true);
  }, [ctx]);

  return useMemo(
    () => ({
      processFile: ctx.processFile,
      registerValidator: ctx.registerValidator,
      registerSanitizer: ctx.registerSanitizer,
      registerTransform: ctx.registerTransform,
      abort: ctx.abort,
      metrics: ctx.metrics,
      submit,
      canSubmit,
      submitDone: ctx.submitDone,
    }),
    [
      ctx.processFile,
      ctx.registerValidator,
      ctx.registerSanitizer,
      ctx.registerTransform,
      ctx.abort,
      ctx.metrics,
      submit,
      canSubmit,
      ctx.submitDone,
    ]
  );
}
