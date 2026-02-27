import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider, useImporterContext } from '../providers/index.js';
import { useImporter } from './useImporter.js';

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

  it('should return processFile, registerValidator, registerSanitizer, registerTransform, abort, and metrics', () => {
    function Consumer() {
      const api = useImporter();
      return (
        <div>
          <span data-testid="processFile">{String(typeof api.processFile === 'function')}</span>
          <span data-testid="registerValidator">{String(typeof api.registerValidator === 'function')}</span>
          <span data-testid="registerSanitizer">{String(typeof api.registerSanitizer === 'function')}</span>
          <span data-testid="registerTransform">{String(typeof api.registerTransform === 'function')}</span>
          <span data-testid="abort">{String(typeof api.abort === 'function')}</span>
          <span data-testid="metrics">{String(api.metrics === null)}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('processFile')).toHaveTextContent('true');
    expect(screen.getByTestId('registerValidator')).toHaveTextContent('true');
    expect(screen.getByTestId('registerSanitizer')).toHaveTextContent('true');
    expect(screen.getByTestId('registerTransform')).toHaveTextContent('true');
    expect(screen.getByTestId('abort')).toHaveTextContent('true');
    expect(screen.getByTestId('metrics')).toHaveTextContent('true');
  });

  it('should call setLayout when layout option is provided', () => {
    const layout = { name: 'my-layout', version: 1, fields: {} as const };
    function Consumer() {
      useImporter({ layout });
      const ctx = useImporterContext();
      return <span data-testid="layoutName">{ctx.layout?.name ?? 'null'}</span>;
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('layoutName')).toHaveTextContent('my-layout');
  });

  it('should call setEngine when engine option is provided', () => {
    function Consumer() {
      useImporter({ engine: 'csv' });
      const ctx = useImporterContext();
      return <span data-testid="engine">{ctx.engine ?? 'null'}</span>;
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('engine')).toHaveTextContent('csv');
  });

  it('should update provider state when processFile is called', () => {
    function Consumer() {
      const { processFile } = useImporter();
      const ctx = useImporterContext();
      return (
        <div>
          <span data-testid="status">{ctx.status}</span>
          <span data-testid="file">{ctx.file === null ? 'null' : ctx.file.name}</span>
          <button type="button" onClick={() => processFile(new File(['a,b'], 'data.csv'))}>
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

  it('should not throw when registerValidator is called with valid args', () => {
    function Consumer() {
      const { registerValidator } = useImporter();
      return (
        <button
          type="button"
          onClick={() => registerValidator('email', () => null, { type: 'cell' })}
        >
          register
        </button>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'register' }))).not.toThrow();
  });
});
