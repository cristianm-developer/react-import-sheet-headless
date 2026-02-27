import { useEffect, useRef } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { RawSheet } from '../../../types/raw-sheet.js';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import { ImporterProvider, useImporterContext } from '../../../providers/index.js';
import { useConvert } from './useConvert.js';

function makeRawSheet(headers: string[], rows: unknown[][]): RawSheet {
  return {
    name: 'S1',
    filesize: 0,
    documentHash: '',
    headers,
    rows: rows.map((cells, index) => ({
      index,
      cells: cells.map((value, i) => ({ key: headers[i] ?? '', value })),
    })),
  };
}

function makeLayout(fieldNames: string[]): SheetLayout {
  const fields: Record<string, { name: string }> = {};
  for (const name of fieldNames) {
    fields[name] = { name };
  }
  return { name: 'Test', version: '1', fields };
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <ImporterProvider>{children}</ImporterProvider>;
}

function ConvertRunner() {
  const ctx = useImporterContext();
  const { convert, convertedSheet, convertResult } = useConvert();
  const didRun = useRef(false);
  const raw = makeRawSheet(['Email', 'Name'], [['a@b.com', 'Alice']]);
  const layout = makeLayout(['Email', 'Name']);
  useEffect(() => {
    ctx.setRawData(raw);
    ctx.setLayout(layout);
  }, []);
  useEffect(() => {
    if (ctx.rawData && ctx.layout && !didRun.current) {
      didRun.current = true;
      convert();
    }
  }, [ctx.rawData, ctx.layout, convert]);
  const headers = convertedSheet?.headers?.join(',') ?? (convertResult ? 'mismatch' : 'none');
  return <span data-testid="result">{headers}</span>;
}

function MismatchRunner() {
  const ctx = useImporterContext();
  const { convert, convertedSheet, convertResult } = useConvert();
  const didRun = useRef(false);
  const raw = makeRawSheet(['Col1', 'Col2'], [['a@b.com', 'Alice']]);
  const layout = makeLayout(['Email', 'Name']);
  useEffect(() => {
    ctx.setRawData(raw);
    ctx.setLayout(layout);
  }, []);
  useEffect(() => {
    if (ctx.rawData && ctx.layout && !didRun.current) {
      didRun.current = true;
      convert();
    }
  }, [ctx.rawData, ctx.layout, convert]);
  const count = convertResult?.mismatches?.length ?? 0;
  return (
    <div>
      <span data-testid="mismatch-count">{count}</span>
      {convertedSheet && <span data-testid="converted">ok</span>}
      {convertResult && (
        <button
          type="button"
          onClick={() => {
            convertResult.renameColumn('Col1', 'Email');
            convertResult.renameColumn('Col2', 'Name');
          }}
        >
          rename
        </button>
      )}
      {convertResult && (
        <button type="button" onClick={() => convertResult.applyMapping()}>
          apply
        </button>
      )}
    </div>
  );
}

describe('useConvert', () => {
  it('should return convertedSheet null and convertResult null when convert has not been run', () => {
    const { result } = renderHook(() => useConvert(), { wrapper });
    expect(result.current.convertedSheet).toBeNull();
    expect(result.current.convertResult).toBeNull();
    expect(typeof result.current.convert).toBe('function');
  });

  it('should set convertedSheet when convert is run with matching headers', async () => {
    render(
      <ImporterProvider>
        <ConvertRunner />
      </ImporterProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Email,Name');
    });
  });

  it('should expose convertResult with mismatches when headers do not match layout', async () => {
    render(
      <ImporterProvider>
        <MismatchRunner />
      </ImporterProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('mismatch-count')).toHaveTextContent('2');
    });
  });

  it('should produce convertedSheet after renameColumn and applyMapping when all columns mapped', async () => {
    render(
      <ImporterProvider>
        <MismatchRunner />
      </ImporterProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('mismatch-count')).toHaveTextContent('2');
    });
    const renameBtn = screen.getByRole('button', { name: 'rename' });
    const applyBtn = screen.getByRole('button', { name: 'apply' });
    await act(async () => {
      renameBtn.click();
    });
    await act(async () => {
      applyBtn.click();
    });
    await waitFor(
      () => {
        expect(screen.getByTestId('converted')).toHaveTextContent('ok');
      },
      { timeout: 2000 },
    );
  });
});
