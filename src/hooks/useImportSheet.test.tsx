import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RawParseResult } from '../types/index.js';
import { ImporterProvider, useImporterContext } from '../providers/index.js';
import { useImporter } from './useImporter.js';
import { useImportSheet } from './useImportSheet.js';

const mockLoad = vi.fn();
const mockParseAll = vi.fn();

vi.mock('../core/parser/hooks/useParserWorker.js', () => ({
  useParserWorker: () => ({
    load: mockLoad,
    parseAll: mockParseAll,
    dispatchProgress: vi.fn(),
    isReady: true,
  }),
}));

function makeFakeResult(): RawParseResult {
  const sheet = {
    name: 'S1',
    filesize: 10,
    documentHash: 'hash-abc',
    headers: ['a'],
    rows: [{ index: 0, cells: [{ key: 'a', value: 1 }] }],
  };
  return { sheets: { S1: sheet } };
}

describe('useImportSheet', () => {
  beforeEach(() => {
    mockLoad.mockReset();
    mockParseAll.mockReset();
  });

  it('should throw when used outside ImporterProvider', () => {
    function Bad() {
      useImportSheet();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/within an ImporterProvider/);
  });

  it('should call load when file is set and status is loading', async () => {
    mockLoad.mockResolvedValue(makeFakeResult());
    function Consumer() {
      const { processFile } = useImporter();
      const { startFullImport } = useImportSheet();
      const { rawData, status } = useImporterContext();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="raw">{rawData ? 'set' : 'null'}</span>
          <button type="button" onClick={() => processFile(new File(['x'], 'f.csv'))}>
            upload
          </button>
          <button type="button" onClick={() => startFullImport()}>full</button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    await act(async () => {
      screen.getByRole('button', { name: 'upload' }).click();
    });
    await waitFor(() => {
      expect(mockLoad).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({ maxRows: 10, fileName: 'f.csv' }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success');
      expect(screen.getByTestId('raw')).toHaveTextContent('set');
    });
  });

  it('should reject startFullImport when no file is loaded', async () => {
    const callbackRef = { current: null as (() => Promise<unknown>) | null };
    function Consumer() {
      const { startFullImport } = useImportSheet();
      useEffect(() => {
        callbackRef.current = startFullImport;
      }, [startFullImport]);
      return <div />;
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    await waitFor(() => {
      expect(callbackRef.current).not.toBeNull();
    });
    await expect(callbackRef.current!()).rejects.toThrow('No file loaded');
  });

  it('should call parseAll and update context when startFullImport is called', async () => {
    mockLoad.mockResolvedValue(makeFakeResult());
    mockParseAll.mockResolvedValue(makeFakeResult());
    function Consumer() {
      const { processFile } = useImporter();
      const { startFullImport } = useImportSheet();
      const { rawData, status } = useImporterContext();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="raw">{rawData ? 'set' : 'null'}</span>
          <button type="button" onClick={() => processFile(new File(['x'], 'f.csv'))}>upload</button>
          <button type="button" onClick={() => startFullImport()}>full</button>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'upload' }).click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success');
    });
    await act(async () => {
      screen.getByRole('button', { name: 'full' }).click();
    });
    await waitFor(() => {
      expect(mockParseAll).toHaveBeenCalled();
      expect(screen.getByTestId('raw')).toHaveTextContent('set');
    });
  });
});
