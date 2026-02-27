import { useCallback, useEffect } from 'react';
import { IMPORTER_PROGRESS_EVENT } from '../types/index.js';
import type { ImporterProgressDetail } from '../types/index.js';
import { useImporterContext } from '../providers/index.js';

export function useImporterEventTarget() {
  const ctx = useImporterContext();
  const target = ctx.progressEventTarget;

  const subscribeToProgress = useCallback(
    (callback: (detail: ImporterProgressDetail) => void) => {
      const handler = (e: Event) => {
        callback((e as CustomEvent<ImporterProgressDetail>).detail);
      };
      target.addEventListener(IMPORTER_PROGRESS_EVENT, handler);
      return () => {
        target.removeEventListener(IMPORTER_PROGRESS_EVENT, handler);
      };
    },
    [target],
  );

  return { progressEventTarget: target, subscribeToProgress };
}

export function useImporterProgressSubscription(
  callback: (detail: ImporterProgressDetail) => void,
) {
  const { subscribeToProgress } = useImporterEventTarget();
  useEffect(() => {
    return subscribeToProgress(callback);
  }, [subscribeToProgress, callback]);
}
