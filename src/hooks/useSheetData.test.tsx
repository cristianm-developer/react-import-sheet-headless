import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Sheet } from '../types/index.js';
import { ImporterProvider, useImporterContext } from '../providers/index.js';
import { useSheetData } from './useSheetData.js';

function createMockSheet(errors: Sheet['errors'] = []): Sheet {
  return {
    name: 'test',
    filesize: 0,
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
      'useImporter must be used within an ImporterProvider',
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
      </ImporterProvider>,
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
      </ImporterProvider>,
    );
    expect(screen.getByTestId('sheetName')).toHaveTextContent('null');
    fireEvent.click(screen.getByRole('button', { name: 'setResult' }));
    expect(screen.getByTestId('sheetName')).toHaveTextContent('test');
    expect(screen.getByTestId('errorsCount')).toHaveTextContent('1');
    expect(screen.getByTestId('firstCode')).toHaveTextContent('INVALID_EMAIL');
  });
});
