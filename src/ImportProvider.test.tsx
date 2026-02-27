import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IMPORTER_PROGRESS_EVENT } from './types';
import { ImportProvider, useImporter } from './ImportProvider';

function Consumer() {
  const { file, rawData, status, setFile, setRawData, setStatus, reset } =
    useImporter();
  return (
    <div>
      <span data-testid="file">{file === null ? 'null' : file.name}</span>
      <span data-testid="rawData">{JSON.stringify(rawData)}</span>
      <span data-testid="status">{status}</span>
      <button type="button" onClick={() => setFile(new File([''], 'test.csv'))}>
        setFile
      </button>
      <button type="button" onClick={() => setRawData([{ a: 1 }])}>
        setRawData
      </button>
      <button type="button" onClick={() => setStatus('loading')}>
        setStatus
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </div>
  );
}

describe('ImportProvider', () => {
  it('proporciona estado inicial: file null, rawData [], status idle', () => {
    render(
      <ImportProvider>
        <Consumer />
      </ImportProvider>,
    );
    expect(screen.getByTestId('file')).toHaveTextContent('null');
    expect(screen.getByTestId('rawData')).toHaveTextContent('[]');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('acepta initialState opcional y lo aplica', () => {
    const file = new File(['a,b'], 'demo.csv');
    render(
      <ImportProvider initialState={{ file, status: 'success', rawData: [{ x: 1 }] }}>
        <Consumer />
      </ImportProvider>,
    );
    expect(screen.getByTestId('file')).toHaveTextContent('demo.csv');
    expect(screen.getByTestId('rawData')).toHaveTextContent('[{"x":1}]');
    expect(screen.getByTestId('status')).toHaveTextContent('success');
  });

  it('setFile actualiza file en el estado', () => {
    render(
      <ImportProvider>
        <Consumer />
      </ImportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setFile' }));
    expect(screen.getByTestId('file')).toHaveTextContent('test.csv');
  });

  it('setRawData actualiza rawData en el estado', () => {
    render(
      <ImportProvider>
        <Consumer />
      </ImportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setRawData' }));
    expect(screen.getByTestId('rawData')).toHaveTextContent('[{"a":1}]');
  });

  it('setStatus actualiza status en el estado', () => {
    render(
      <ImportProvider>
        <Consumer />
      </ImportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setStatus' }));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('reset restaura el estado inicial', () => {
    render(
      <ImportProvider>
        <Consumer />
      </ImportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'setFile' }));
    fireEvent.click(screen.getByRole('button', { name: 'setRawData' }));
    fireEvent.click(screen.getByRole('button', { name: 'setStatus' }));
    expect(screen.getByTestId('file')).toHaveTextContent('test.csv');
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    expect(screen.getByTestId('file')).toHaveTextContent('null');
    expect(screen.getByTestId('rawData')).toHaveTextContent('[]');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('dispatchProgress dispara evento importer-progress en progressEventTarget', () => {
    let received: unknown = null;
    function ProgressListener() {
      const { progressEventTarget, dispatchProgress } = useImporter();
      return (
        <button
          type="button"
          onClick={() => {
            const handler = (e: Event) => {
              received = (e as CustomEvent).detail;
            };
            progressEventTarget.addEventListener(IMPORTER_PROGRESS_EVENT, handler);
            dispatchProgress({
              phase: 'validating',
              globalPercent: 50,
              localPercent: 25,
              currentRow: 250,
              totalRows: 1000,
            });
            progressEventTarget.removeEventListener(IMPORTER_PROGRESS_EVENT, handler);
          }}
        >
          dispatch
        </button>
      );
    }
    render(
      <ImportProvider>
        <ProgressListener />
      </ImportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'dispatch' }));
    expect(received).toEqual({
      phase: 'validating',
      globalPercent: 50,
      localPercent: 25,
      currentRow: 250,
      totalRows: 1000,
    });
  });
});

describe('useImporter', () => {
  it('lanza error si se usa fuera de ImportProvider', () => {
    function BadConsumer() {
      useImporter();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImportProvider',
    );
  });
});
