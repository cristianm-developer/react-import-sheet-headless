import { useMemo } from 'react';
import { useImporterContext } from '../providers/index.js';

export function useImporterStatus() {
  const ctx = useImporterContext();
  return useMemo(
    () => ({
      status: ctx.status,
      progressEventTarget: ctx.progressEventTarget,
    }),
    [ctx.status, ctx.progressEventTarget],
  );
}
