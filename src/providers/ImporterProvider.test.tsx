import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IMPORTER_ABORTED_EVENT, IMPORTER_PROGRESS_EVENT } from '../types/index.js';
import { ImporterProvider, useImporterContext } from './index.js';
import {
  useImporter,
  useImporterEventTarget,
  useImporterStatus,
  useSheetData,
  useSheetEditor,
} from '../index.js';

function StatusConsumer() {
  const { file, rawData, documentHash, status, result } = useImporterContext();
  return (
    <div>
      <span data-testid="file">{file === null ? 'null' : file.name}</span>
      <span data-testid="rawData">{rawData === null ? 'null' : 'set'}</span>
      <span data-testid="documentHash">{documentHash ?? 'null'}</span>
      <span data-testid="status">{status}</span>
      <span data-testid="result">{result === null ? 'null' : 'set'}</span>
    </div>
  );
}

function ActionsConsumer() {
  const ctx = useImporterContext();
  return (
    <div>
      <button
        type="button"
        onClick={() => ctx.setFile(new File([''], 'test.csv'))}
      >
        setFile
      </button>
      <button type="button" onClick={() => ctx.setStatus('loading')}>
        setStatus
      </button>
      <button type="button" onClick={() => ctx.abort()}>
        abort
      </button>
      <button
        type="button"
        onClick={() => {
          ctx.registerValidator('email', () => null, { type: 'cell' });
        }}
      >
        registerValidator
      </button>
    </div>
  );
}

describe('ImporterProvider', () => {
  it('should provide initial state with file null, rawData null, documentHash null, status idle, result null', () => {
    render(
      <ImporterProvider>
        <StatusConsumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('file')).toHaveTextContent('null');
    expect(screen.getByTestId('rawData')).toHaveTextContent('null');
    expect(screen.getByTestId('documentHash')).toHaveTextContent('null');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('result')).toHaveTextContent('null');
  });

  it('should update file and status when setFile and setStatus are called', () => {
    render(
      <ImporterProvider>
        <StatusConsumer />
        <ActionsConsumer />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setFile' }));
    expect(screen.getByTestId('file')).toHaveTextContent('test.csv');
    fireEvent.click(screen.getByRole('button', { name: 'setStatus' }));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('should dispatch importer-progress when dispatchProgress is called', () => {
    let received: unknown = null;
    function ProgressListener() {
      const ctx = useImporterContext();
      return (
        <button
          type="button"
          onClick={() => {
            const handler = (e: Event) => {
              received = (e as CustomEvent).detail;
            };
            ctx.progressEventTarget.addEventListener(
              IMPORTER_PROGRESS_EVENT,
              handler,
            );
            ctx.dispatchProgress({
              phase: 'validating',
              globalPercent: 50,
              currentRow: 250,
              totalRows: 1000,
            });
            ctx.progressEventTarget.removeEventListener(
              IMPORTER_PROGRESS_EVENT,
              handler,
            );
          }}
        >
          dispatch
        </button>
      );
    }
    render(
      <ImporterProvider>
        <ProgressListener />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'dispatch' }));
    expect(received).toEqual({
      phase: 'validating',
      globalPercent: 50,
      currentRow: 250,
      totalRows: 1000,
    });
  });

  it('should set status to cancelled and dispatch importer-aborted when abort is called', () => {
    const abortedRef = { current: false };
    function AbortListener() {
      const ctx = useImporterContext();
      useEffect(() => {
        const handler = () => {
          abortedRef.current = true;
        };
        ctx.progressEventTarget.addEventListener(IMPORTER_ABORTED_EVENT, handler);
        return () =>
          ctx.progressEventTarget.removeEventListener(
            IMPORTER_ABORTED_EVENT,
            handler,
          );
      }, [ctx.progressEventTarget]);
      return (
        <>
          <button type="button" onClick={() => ctx.abort()}>
            abort
          </button>
          <span data-testid="status">{ctx.status}</span>
        </>
      );
    }
    render(
      <ImporterProvider>
        <AbortListener />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'abort' }));
    expect(screen.getByTestId('status')).toHaveTextContent('cancelled');
    expect(abortedRef.current).toBe(true);
  });

  it('should allow registerValidator without throwing', () => {
    render(
      <ImporterProvider>
        <ActionsConsumer />
      </ImporterProvider>,
    );
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'registerValidator' })),
    ).not.toThrow();
  });

  it('should allow registerSanitizer and registerTransform without throwing', () => {
    function RegistryConsumer() {
      const ctx = useImporterContext();
      return (
        <div>
          <button
            type="button"
            onClick={() => ctx.registerSanitizer('trim', (v) => v, { type: 'cell' })}
          >
            registerSanitizer
          </button>
          <button
            type="button"
            onClick={() => ctx.registerTransform('upper', (v) => v, { type: 'cell' })}
          >
            registerTransform
          </button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <RegistryConsumer />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'registerSanitizer' }));
    fireEvent.click(screen.getByRole('button', { name: 'registerTransform' }));
  });

  it('should call worker.terminate() when abort is called and a worker was set', () => {
    const terminateMock = vi.fn();
    const mockWorker = { terminate: terminateMock } as unknown as Worker;
    function AbortWithWorkerConsumer() {
      const ctx = useImporterContext();
      return (
        <div>
          <button type="button" onClick={() => ctx.setActiveWorker(mockWorker)}>
            setWorker
          </button>
          <button type="button" onClick={() => ctx.abort()}>
            abort
          </button>
          <span data-testid="status">{ctx.status}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <AbortWithWorkerConsumer />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setWorker' }));
    fireEvent.click(screen.getByRole('button', { name: 'abort' }));
    expect(terminateMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status')).toHaveTextContent('cancelled');
  });

  it('should call worker.terminate() on unmount when a worker was set', () => {
    const terminateMock = vi.fn();
    const mockWorker = { terminate: terminateMock } as unknown as Worker;
    function SetWorkerConsumer() {
      const ctx = useImporterContext();
      useEffect(() => {
        ctx.setActiveWorker(mockWorker);
      }, [ctx]);
      return <span data-testid="mounted">mounted</span>;
    }
    const { unmount } = render(
      <ImporterProvider>
        <SetWorkerConsumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('mounted')).toBeInTheDocument();
    unmount();
    expect(terminateMock).toHaveBeenCalledTimes(1);
  });
});

describe('useImporterContext', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useImporterContext();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should expose all context API: state, setters, processFile, register*, abort, dispatchProgress, setActiveWorker', () => {
    function Consumer() {
      const ctx = useImporterContext();
      const keys = [
        'file', 'rawData', 'documentHash', 'status', 'result', 'layout',
        'progressEventTarget', 'setLayout', 'setFile', 'setRawData', 'setDocumentHash',
        'setStatus', 'setResult', 'processFile', 'registerValidator', 'registerSanitizer',
        'registerTransform', 'abort', 'dispatchProgress', 'setActiveWorker',
      ];
      const missing = keys.filter((k) => !(k in ctx));
      return <span data-testid="missing">{missing.length > 0 ? missing.join(',') : 'none'}</span>;
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('missing')).toHaveTextContent('none');
  });

  it('should update rawData and documentHash when setRawData and setDocumentHash are called', () => {
    const rawSheet = {
      name: 'x',
      filesize: 0,
      headers: ['a'],
      rows: [{ index: 0, cells: [{ key: 'a', value: 1 }] }],
    };
    function Consumer() {
      const ctx = useImporterContext();
      return (
        <div>
          <span data-testid="rawData">{ctx.rawData === null ? 'null' : 'set'}</span>
          <span data-testid="documentHash">{ctx.documentHash ?? 'null'}</span>
          <button type="button" onClick={() => ctx.setRawData(rawSheet)}>setRawData</button>
          <button type="button" onClick={() => ctx.setDocumentHash('hash-123')}>setDocumentHash</button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('rawData')).toHaveTextContent('null');
    expect(screen.getByTestId('documentHash')).toHaveTextContent('null');
    fireEvent.click(screen.getByRole('button', { name: 'setRawData' }));
    expect(screen.getByTestId('rawData')).toHaveTextContent('set');
    fireEvent.click(screen.getByRole('button', { name: 'setDocumentHash' }));
    expect(screen.getByTestId('documentHash')).toHaveTextContent('hash-123');
  });

  it('should update layout when setLayout is called', () => {
    function Consumer() {
      const ctx = useImporterContext();
      return (
        <div>
          <span data-testid="layout">{ctx.layout?.name ?? 'null'}</span>
          <button
            type="button"
            onClick={() => ctx.setLayout({ name: 'custom', version: 2, fields: {} })}
          >
            setLayout
          </button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('layout')).toHaveTextContent('null');
    fireEvent.click(screen.getByRole('button', { name: 'setLayout' }));
    expect(screen.getByTestId('layout')).toHaveTextContent('custom');
  });
});

describe('useImporter', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useImporter();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return processFile, registerValidator, registerSanitizer, registerTransform, abort', () => {
    function Consumer() {
      const api = useImporter();
      return (
        <div>
          <span data-testid="hasProcessFile">{String(typeof api.processFile === 'function')}</span>
          <span data-testid="hasAbort">{String(typeof api.abort === 'function')}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('hasProcessFile')).toHaveTextContent('true');
    expect(screen.getByTestId('hasAbort')).toHaveTextContent('true');
  });
});

describe('useImporterStatus', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useImporterStatus();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return status and progressEventTarget', () => {
    function Consumer() {
      const { status, progressEventTarget } = useImporterStatus();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="hasTarget">{String(progressEventTarget != null)}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('hasTarget')).toHaveTextContent('true');
  });
});

describe('useSheetData', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useSheetData();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return sheet and errors (empty when result is null)', () => {
    function Consumer() {
      const { sheet, errors } = useSheetData();
      return (
        <div>
          <span data-testid="sheet">{sheet === null ? 'null' : 'set'}</span>
          <span data-testid="errors">{JSON.stringify(errors)}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('sheet')).toHaveTextContent('null');
    expect(screen.getByTestId('errors')).toHaveTextContent('[]');
  });
});

describe('useSheetEditor', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useSheetEditor();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return editCell function', () => {
    function Consumer() {
      const { editCell } = useSheetEditor();
      return (
        <span data-testid="hasEditCell">
          {String(typeof editCell === 'function')}
        </span>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('hasEditCell')).toHaveTextContent('true');
  });
});

describe('useImporterEventTarget', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useImporterEventTarget();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return progressEventTarget and subscribeToProgress with cleanup', () => {
    let received: unknown = null;
    function Consumer() {
      const { progressEventTarget, subscribeToProgress } = useImporterEventTarget();
      const [unsub, setUnsub] = useState<(() => void) | null>(null);
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              const unsubFn = subscribeToProgress((d) => {
                received = d;
              });
              setUnsub(() => unsubFn);
            }}
          >
            subscribe
          </button>
          <button
            type="button"
            onClick={() => {
              progressEventTarget.dispatchEvent(
                new CustomEvent(IMPORTER_PROGRESS_EVENT, {
                  detail: { phase: 'test', globalPercent: 10 },
                }),
              );
            }}
          >
            dispatch
          </button>
          <button type="button" onClick={() => unsub?.()}>
            unsubscribe
          </button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'subscribe' }));
    fireEvent.click(screen.getByRole('button', { name: 'dispatch' }));
    expect(received).toEqual({ phase: 'test', globalPercent: 10 });
  });
});

describe('processFile and layout', () => {
  it('should set file and status to loading when processFile is called', () => {
    function Consumer() {
      const { processFile } = useImporter();
      const { status } = useImporterStatus();
      const { file } = useImporterContext();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="file">{file === null ? 'null' : file.name}</span>
          <button
            type="button"
            onClick={() => processFile(new File(['a,b'], 'data.csv'))}
          >
            process
          </button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    fireEvent.click(screen.getByRole('button', { name: 'process' }));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(screen.getByTestId('file')).toHaveTextContent('data.csv');
  });

  it('should accept initial layout prop', () => {
    const layout = {
      name: 'test',
      version: 1 as const,
      fields: {} as const,
    };
    function Consumer() {
      const ctx = useImporterContext();
      return (
        <span data-testid="layoutName">{ctx.layout?.name ?? 'null'}</span>
      );
    }
    render(
      <ImporterProvider layout={layout}>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('layoutName')).toHaveTextContent('test');
  });
});
