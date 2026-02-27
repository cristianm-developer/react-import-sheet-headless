import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider } from '../providers/index.js';
import { useImporterStatus } from './useImporterStatus.js';

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

  it('should return status and progressEventTarget when inside provider', () => {
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

  it('should return the same progressEventTarget reference across re-renders', () => {
    const refs: EventTarget[] = [];
    function Consumer() {
      const { progressEventTarget } = useImporterStatus();
      refs.push(progressEventTarget);
      return <span data-testid="count">{refs.length}</span>;
    }
    const { rerender } = render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    rerender(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(refs[0]).toBe(refs[1]);
  });
});
