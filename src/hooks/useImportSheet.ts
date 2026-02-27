import { useCallback, useEffect } from 'react';
import { useImporterContext } from '../providers/index.js';
import { useParserWorker } from '../core/parser/hooks/useParserWorker.js';

function firstSheetFromResult(
  result: { sheets: Readonly<Record<string, { documentHash: string }>> },
): { documentHash: string } | null {
  const names = Object.keys(result.sheets);
  if (names.length === 0) return null;
  return result.sheets[names[0] ?? ''] ?? null;
}

export function useImportSheet() {
  const ctx = useImporterContext();
  const { load, parseAll, isReady } = useParserWorker();

  useEffect(() => {
    const { file, status, engine } = ctx;
    if (!isReady || !file || status !== 'loading') return;
    load(file, { maxRows: 10, fileName: file.name, engine: engine ?? undefined })
      .then((result) => {
        const first = firstSheetFromResult(result);
        if (!first) {
          ctx.setStatus('error');
          return;
        }
        const sheet = result.sheets[Object.keys(result.sheets)[0] ?? ''];
        if (!sheet) {
          ctx.setStatus('error');
          return;
        }
        ctx.setRawData(sheet);
        ctx.setDocumentHash(sheet.documentHash);
        ctx.setStatus('success');
      })
      .catch(() => {
        ctx.setStatus('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when file/status/isReady/load change; ctx setters are stable
  }, [isReady, ctx.file, ctx.status, ctx.setRawData, ctx.setDocumentHash, ctx.setStatus, load]);

  const startFullImport = useCallback(() => {
    const { file } = ctx;
    if (!file) return Promise.reject(new Error('No file loaded'));
    ctx.setStatus('loading');
    return parseAll((detail) => ctx.dispatchProgress(detail)).then((result) => {
      const first = firstSheetFromResult(result);
      if (!first) {
        ctx.setStatus('error');
        return result;
      }
      const sheet = result.sheets[Object.keys(result.sheets)[0] ?? ''];
      if (!sheet) {
        ctx.setStatus('error');
        return result;
      }
      ctx.setRawData(sheet);
      ctx.setDocumentHash(sheet.documentHash);
      ctx.setStatus('success');
      return result;
    });
  }, [ctx, parseAll]);

  return { startFullImport };
}
