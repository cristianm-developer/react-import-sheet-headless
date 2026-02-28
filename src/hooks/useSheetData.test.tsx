import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Sheet } from '../types/index.js';
import { getCellValue } from '../core/view/export/sheet-to-objects.js';
import { ImporterProvider, useImporterContext } from '../providers/index.js';
import { useSheetData } from './useSheetData.js';

function createMockSheet(errors: Sheet['errors'] = []): Sheet {
  return {
    name: 'test',
    filesize: 0,
    documentHash: 'mock-hash',
    headers: [],
    rows: [],
    sheetLayout: { name: 'layout', version: 1 },
    errors,
  };
}

describe('useSheetData', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useSheetData();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider'
    );
  });

  it('should return sheet null and empty errors when result is null', () => {
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
      </ImporterProvider>
    );
    expect(screen.getByTestId('sheet')).toHaveTextContent('null');
    expect(screen.getByTestId('errors')).toHaveTextContent('[]');
  });

  it('should return sheet and errors from result when result is set', () => {
    const mockSheet = createMockSheet([{ code: 'INVALID_EMAIL', params: { value: 'x' } }]);
    function SetResultThenShow() {
      const ctx = useImporterContext();
      const { sheet, errors } = useSheetData();
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(mockSheet)}>
            setResult
          </button>
          <span data-testid="sheetName">{sheet?.name ?? 'null'}</span>
          <span data-testid="errorsCount">{errors.length}</span>
          <span data-testid="firstCode">{errors[0]?.code ?? ''}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <SetResultThenShow />
      </ImporterProvider>
    );
    expect(screen.getByTestId('sheetName')).toHaveTextContent('null');
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('sheetName')).toHaveTextContent('test');
    expect(screen.getByTestId('errorsCount')).toHaveTextContent('1');
    expect(screen.getByTestId('firstCode')).toHaveTextContent('INVALID_EMAIL');
  });

  it('should return empty array from toObjects when result is null', () => {
    function Consumer() {
      const { toObjects } = useSheetData();
      const list = toObjects((r) => ({ x: getCellValue(r, 'x') }));
      return <span data-testid="len">{list.length}</span>;
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>
    );
    expect(screen.getByTestId('len')).toHaveTextContent('0');
  });

  it('should return mapped objects from toObjects when result is set', () => {
    const mockSheet = createMockSheet();
    (mockSheet as Sheet).rows = [
      {
        index: 0,
        errors: [],
        cells: [
          { key: 'Nombre', value: 'Ana', errors: [] },
          { key: 'Apellido', value: 'López', errors: [] },
        ],
      },
    ];
    function SetResultThenMap() {
      const ctx = useImporterContext();
      const { toObjects } = useSheetData();
      const list = toObjects((r) => ({
        nombre: getCellValue(r, 'Nombre'),
        apellido: getCellValue(r, 'Apellido'),
      }));
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(mockSheet)}>
            setResult
          </button>
          <span data-testid="json">{JSON.stringify(list)}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <SetResultThenMap />
      </ImporterProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('json')).toHaveTextContent('[{"nombre":"Ana","apellido":"López"}]');
  });

  it('should return mapped objects from toObjectsWithKeyMap when result is set', () => {
    const mockSheet = createMockSheet();
    (mockSheet as Sheet).rows = [
      {
        index: 0,
        errors: [],
        cells: [
          { key: 'Nombre', value: 'Ana', errors: [] },
          { key: 'Apellido', value: 'López', errors: [] },
        ],
      },
    ];
    function SetResultThenMap() {
      const ctx = useImporterContext();
      const { toObjectsWithKeyMap } = useSheetData();
      const list = toObjectsWithKeyMap({ Nombre: 'nombre', Apellido: 'apellido' });
      return (
        <div>
          <button type="button" onClick={() => ctx.setResult(mockSheet)}>
            setResult
          </button>
          <span data-testid="json">{JSON.stringify(list)}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <SetResultThenMap />
      </ImporterProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('json')).toHaveTextContent('[{"nombre":"Ana","apellido":"López"}]');
  });
});
