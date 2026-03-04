import { useCallback, useEffect } from 'react';
import { useImporterContext } from '../providers/index.js';
import { useParserWorker } from '../core/parser/hooks/useParserWorker.js';
import type { SheetError } from '../types/error.js';

function firstSheetFromResult(result: {
  sheets: Readonly<Record<string, { documentHash: string }>>;
}): { documentHash: string } | null {
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
          const error: SheetError = {
            code: 'PARSER_NO_SHEETS',
            level: 'fatal',
            message: 'No sheets found in the file. The file may be empty or corrupted.',
            params: { fileName: file.name, fileSize: file.size, fileType: file.type },
          };
          ctx.setGlobalErrors([error]);
          ctx.setStatus('error');
          return;
        }
        const sheet = result.sheets[Object.keys(result.sheets)[0] ?? ''];
        if (!sheet) {
          const error: SheetError = {
            code: 'PARSER_SHEET_ACCESS_FAILED',
            level: 'fatal',
            message: 'Failed to access the first sheet in the file.',
            params: { fileName: file.name },
          };
          ctx.setGlobalErrors([error]);
          ctx.setStatus('error');
          return;
        }
        ctx.setRawData(sheet);
        ctx.setDocumentHash(sheet.documentHash);
        ctx.setStatus('success');
      })
      .catch((err: unknown) => {
        const error: SheetError = {
          code: 'PARSER_FAILED',
          level: 'fatal',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to parse the file. The file may be corrupted or in an unsupported format.',
          params: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            originalError: err instanceof Error ? err.message : String(err),
          },
        };
        ctx.setGlobalErrors([error]);
        ctx.setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when file/status/isReady/load change; ctx setters are stable
  }, [
    isReady,
    ctx.file,
    ctx.status,
    ctx.setRawData,
    ctx.setDocumentHash,
    ctx.setStatus,
    ctx.setGlobalErrors,
    load,
  ]);

  const startFullImport = useCallback(() => {
    const { file } = ctx;
    if (!file) return Promise.reject(new Error('No file loaded'));
    ctx.setStatus('loading');
    const t0 = performance.now();
    return parseAll((detail) => ctx.dispatchProgress(detail))
      .then((result) => {
        const t1 = performance.now();
        ctx.setPhaseTiming('parse', t1 - t0);
        const first = firstSheetFromResult(result);
        if (!first) {
          const error: SheetError = {
            code: 'PARSER_NO_SHEETS',
            level: 'fatal',
            message: 'No sheets found in the file. The file may be empty or corrupted.',
            params: { fileName: file.name, fileSize: file.size, fileType: file.type },
          };
          ctx.setGlobalErrors([error]);
          ctx.setStatus('error');
          return result;
        }
        const sheet = result.sheets[Object.keys(result.sheets)[0] ?? ''];
        if (!sheet) {
          const error: SheetError = {
            code: 'PARSER_SHEET_ACCESS_FAILED',
            level: 'fatal',
            message: 'Failed to access the first sheet in the file.',
            params: { fileName: file.name },
          };
          ctx.setGlobalErrors([error]);
          ctx.setStatus('error');
          return result;
        }
        ctx.setRawData(sheet);
        ctx.setDocumentHash(sheet.documentHash);
        ctx.setStatus('success');
        return result;
      })
      .catch((err: unknown) => {
        const error: SheetError = {
          code: 'PARSER_FAILED',
          level: 'fatal',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to parse the file. The file may be corrupted or in an unsupported format.',
          params: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            originalError: err instanceof Error ? err.message : String(err),
          },
        };
        ctx.setGlobalErrors([error]);
        ctx.setStatus('error');
        throw err;
      });
  }, [ctx, parseAll]);

  return { startFullImport };
}
