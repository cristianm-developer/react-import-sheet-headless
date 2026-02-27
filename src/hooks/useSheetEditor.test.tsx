import { createElement } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Sheet, ValidatedRow } from '../types/index.js';
import { ImporterProvider, useImporterContext } from '../providers/index.js';
import { useSheetEditor } from './useSheetEditor.js';
import { setCellValue } from '../core/editor/immutable-update.js';

const mockRunEdit = vi.fn();
vi.mock('../core/editor/hooks/useEditWorker.js', () => ({
  useEditWorker: () => ({
    runEdit: mockRunEdit,
    isReady: true,
  }),
}));

function createMockSheet(rows: ValidatedRow[] = []): Sheet {
  return {
    name: 'test',
    filesize: 0,
    documentHash: 'h',
    headers: ['a', 'b'],
    sheetLayout: { name: 'l', version: 1 },
    errors: [],
    rows,
  };
}

const layout = {
  name: 'l',
  version: 1,
  fields: {
    a: { name: 'a', validators: [], transformations: [] },
    b: { name: 'b', validators: [], transformations: [] },
  },
};

describe('useSheetEditor', () => {
  beforeEach(() => {
    mockRunEdit.mockReset();
  });

  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useSheetEditor();
      return null;
    }
    expect(() => render(createElement(BadConsumer))).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return sheet, editCell, pageData, totalPages and isReady', () => {
    function Consumer() {
      const out = useSheetEditor({ page: 1, pageSize: 10 });
      return (
        <div>
          <span data-testid="sheet">{out.sheet === null ? 'null' : 'set'}</span>
          <span data-testid="totalPages">{out.totalPages}</span>
          <span data-testid="rowsLen">{out.pageData.rows.length}</span>
          <span data-testid="ready">{out.isReady ? 'yes' : 'no'}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, null, createElement(Consumer)),
    );
    expect(screen.getByTestId('sheet')).toHaveTextContent('null');
    expect(screen.getByTestId('totalPages')).toHaveTextContent('0');
    expect(screen.getByTestId('rowsLen')).toHaveTextContent('0');
    expect(screen.getByTestId('ready')).toHaveTextContent('yes');
  });

  it('should return pageData and totalPages derived from sheet and page/pageSize', () => {
    const row0 = {
      index: 0,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 1, errors: [] as readonly unknown[] },
        { key: 'b', value: 'x', errors: [] as readonly unknown[] },
      ],
    };
    const row1 = {
      index: 1,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 2, errors: [] as readonly unknown[] },
        { key: 'b', value: 'y', errors: [] as readonly unknown[] },
      ],
    };
    const mockSheet = createMockSheet([row0, row1]);
    function SetResultThenShow() {
      const ctx = useImporterContext();
      const { pageData, totalPages } = useSheetEditor({ page: 1, pageSize: 1 });
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(mockSheet)}>
            setResult
          </button>
          <span data-testid="totalPages">{totalPages}</span>
          <span data-testid="page">{pageData.page}</span>
          <span data-testid="rowsCount">{pageData.rows.length}</span>
          <span data-testid="rowIndex">{pageData.rows[0]?.index ?? '-'}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, null, createElement(SetResultThenShow)),
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('totalPages')).toHaveTextContent('2');
    expect(screen.getByTestId('page')).toHaveTextContent('1');
    expect(screen.getByTestId('rowsCount')).toHaveTextContent('1');
    expect(screen.getByTestId('rowIndex')).toHaveTextContent('0');
  });

  it('should call runEdit and setResult when editCell is invoked with sheet and layout', async () => {
    const row0 = {
      index: 0,
      errors: [] as readonly unknown[],
      cells: [
        { key: 'a', value: 1, errors: [] as readonly unknown[] },
        { key: 'b', value: 'x', errors: [] as readonly unknown[] },
      ],
    };
    const mockSheet = createMockSheet([row0]);
    const updatedSheet = setCellValue(mockSheet, 0, 'a', 99);
    mockRunEdit.mockResolvedValue(updatedSheet);
    function Consumer() {
      const ctx = useImporterContext();
      const { editCell } = useSheetEditor();
      const cellValue = ctx.result?.rows[0]?.cells[0]?.value;
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(mockSheet)}>
            setSheet
          </button>
          <button
            type="button"
            onClick={() => editCell({ rowIndex: 0, cellKey: 'a', value: 99 })}
          >
            edit
          </button>
          <span data-testid="cellValue">{String(cellValue ?? '')}</span>
        </div>
      );
    }
    render(
      createElement(ImporterProvider, { layout }, createElement(Consumer)),
    );
    fireEvent.click(screen.getByRole('button', { name: 'setSheet' }));
    expect(screen.getByTestId('cellValue')).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    await waitFor(() => {
      expect(mockRunEdit).toHaveBeenCalledWith(
        mockSheet,
        layout,
        0,
        'a',
        99,
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('cellValue')).toHaveTextContent('99');
    });
  });

  it('should return stable editCell reference across re-renders', () => {
    const refs: unknown[] = [];
    function Consumer() {
      const { editCell } = useSheetEditor();
      refs.push(editCell);
      return <span data-testid="count">{refs.length}</span>;
    }
    const { rerender } = render(
      createElement(ImporterProvider, null, createElement(Consumer)),
    );
    rerender(
      createElement(ImporterProvider, null, createElement(Consumer)),
    );
    expect(refs[0]).toBe(refs[1]);
  });
});
