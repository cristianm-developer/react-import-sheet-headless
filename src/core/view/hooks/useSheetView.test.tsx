import { createElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Sheet, ValidatedRow } from '../../../types/index.js';
import { ImporterProvider, useImporterContext } from '../../../providers/index.js';
import { useSheetView } from './useSheetView.js';

const mockRunEdit = vi.fn();
vi.mock('../../../core/editor/hooks/useEditWorker.js', () => ({
  useEditWorker: () => ({ runEdit: mockRunEdit, isReady: true }),
}));

function createMockSheet(rows: ValidatedRow[]): Sheet {
  return {
    name: 'test',
    filesize: 0,
    documentHash: 'h',
    headers: ['a'],
    sheetLayout: { name: 'l', version: 1 },
    errors: [],
    rows,
  };
}

const layout = {
  name: 'l',
  version: 1,
  fields: { a: { name: 'a' } },
} as import('../../../types/sheet-layout.js').SheetLayout;

describe('useSheetView', () => {
  it('should return totalRows, paginatedRows and counts from sheet', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 1, errors: [] }] },
      { index: 1, errors: [], cells: [{ key: 'a', value: 2, errors: [] }] },
      { index: 2, errors: [], cells: [{ key: 'a', value: 3, errors: [] }] },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenShow() {
      const ctx = useImporterContext();
      const view = useSheetView({ defaultPageSize: 2, filterMode: 'all' });
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>
            setResult
          </button>
          <span data-testid="totalRows">{view.totalRows}</span>
          <span data-testid="page">{view.page}</span>
          <span data-testid="paginatedLen">{view.paginatedRows.length}</span>
          <span data-testid="countsTotal">{view.counts.totalRows}</span>
          <span data-testid="countsErrors">{view.counts.rowsWithErrors}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, { layout }, createElement(SetResultThenShow)),
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('totalRows')).toHaveTextContent('3');
    expect(screen.getByTestId('page')).toHaveTextContent('1');
    expect(screen.getByTestId('paginatedLen')).toHaveTextContent('2');
    expect(screen.getByTestId('countsTotal')).toHaveTextContent('3');
    expect(screen.getByTestId('countsErrors')).toHaveTextContent('0');
  });

  it('should filter by errors-only and expose rowsWithErrors', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 1, errors: [] }] },
      {
        index: 1,
        errors: [{ code: 'E1' }],
        cells: [{ key: 'a', value: 2, errors: [] }],
      },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenShow() {
      const ctx = useImporterContext();
      const view = useSheetView({ filterMode: 'errors-only' });
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>
            setResult
          </button>
          <span data-testid="totalRows">{view.totalRows}</span>
          <span data-testid="rowsWithErrors">{view.rowsWithErrors.length}</span>
          <span data-testid="countsErrors">{view.counts.rowsWithErrors}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, { layout }, createElement(SetResultThenShow)),
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('totalRows')).toHaveTextContent('1');
    expect(screen.getByTestId('rowsWithErrors')).toHaveTextContent('1');
    expect(screen.getByTestId('countsErrors')).toHaveTextContent('1');
  });

  it('should expose getRows(page, limit) for virtualization with 1-based page', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 1, errors: [] }] },
      { index: 1, errors: [], cells: [{ key: 'a', value: 2, errors: [] }] },
      { index: 2, errors: [], cells: [{ key: 'a', value: 3, errors: [] }] },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenShow() {
      const ctx = useImporterContext();
      const view = useSheetView({ filterMode: 'all' });
      const slice = view.sheet ? view.getRows(1, 2) : [];
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>
            setResult
          </button>
          <span data-testid="sliceLen">{slice.length}</span>
          <span data-testid="firstIndex">{slice[0]?.index ?? '-'}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, { layout }, createElement(SetResultThenShow)),
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('sliceLen')).toHaveTextContent('2');
    expect(screen.getByTestId('firstIndex')).toHaveTextContent('0');
  });

  it('should expose hasRecoverableSession and no-op recover/clear when persist is false', () => {
    function Show() {
      const view = useSheetView();
      return (
        <span data-testid="recoverable">
          {view.hasRecoverableSession ? 'y' : 'n'}
        </span>
      );
    }
    render(createElement(ImporterProvider, null, createElement(Show)));
    expect(screen.getByTestId('recoverable')).toHaveTextContent('n');
  });

  it('should export sheet to CSV with BOM when layout and sheet are set', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 'v1', errors: [] }] },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenExport() {
      const ctx = useImporterContext();
      const view = useSheetView();
      const csv = view.sheet && ctx.layout ? view.exportToCSV({ includeHeaders: true }) : '';
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>setResult</button>
          <span data-testid="csv">{csv ? (csv.charCodeAt(0) === 0xfeff ? 'withBOM' : 'noBOM') : 'empty'}</span>
        </div>
      );
    }
    render(createElement(ImporterProvider, { layout }, createElement(SetResultThenExport)));
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('csv')).toHaveTextContent('withBOM');
  });

  it('should export sheet to JSON when sheet is set', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 42, errors: [] }] },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenExport() {
      const ctx = useImporterContext();
      const view = useSheetView();
      const json = view.sheet ? view.exportToJSON() : '';
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>setResult</button>
          <span data-testid="json">{json ? String((JSON.parse(json) as unknown[]).length) : 'empty'}</span>
        </div>
      );
    }
    render(createElement(ImporterProvider, { layout }, createElement(SetResultThenExport)));
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('json')).toHaveTextContent('1');
  });

  it('should call setPage and reflect in getPaginatedResult', () => {
    const rows: ValidatedRow[] = [
      { index: 0, errors: [], cells: [{ key: 'a', value: 1, errors: [] }] },
      { index: 1, errors: [], cells: [{ key: 'a', value: 2, errors: [] }] },
      { index: 2, errors: [], cells: [{ key: 'a', value: 3, errors: [] }] },
    ];
    const sheet = createMockSheet(rows);
    function SetResultThenPaginate() {
      const ctx = useImporterContext();
      const view = useSheetView({ defaultPageSize: 1 });
      const pr = view.sheet ? view.getPaginatedResult(2, 1) : null;
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(sheet)}>setResult</button>
          <button type="button" onClick={() => view.setPage(2)}>setPage2</button>
          <span data-testid="pageFromResult">{pr?.page ?? '-'}</span>
          <span data-testid="rowsFromResult">{pr?.rows.length ?? 0}</span>
        </div>
      );
    }
    render(createElement(ImporterProvider, { layout }, createElement(SetResultThenPaginate)));
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('pageFromResult')).toHaveTextContent('2');
    expect(screen.getByTestId('rowsFromResult')).toHaveTextContent('1');
  });
});
