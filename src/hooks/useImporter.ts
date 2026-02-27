import { useEffect, useMemo } from 'react';
import { useImporterContext } from '../providers/index.js';
import type { UseImporterOptions } from './types.js';

export function useImporter(options: UseImporterOptions = {}) {
  const ctx = useImporterContext();
  const { layout: layoutOption } = options;

  useEffect(() => {
    if (layoutOption !== undefined) {
      ctx.setLayout(layoutOption);
    }
  }, [ctx, layoutOption]);

  return useMemo(
    () => ({
      processFile: ctx.processFile,
      registerValidator: ctx.registerValidator,
      registerSanitizer: ctx.registerSanitizer,
      registerTransform: ctx.registerTransform,
      abort: ctx.abort,
    }),
    [
      ctx.processFile,
      ctx.registerValidator,
      ctx.registerSanitizer,
      ctx.registerTransform,
      ctx.abort,
    ],
  );
}
