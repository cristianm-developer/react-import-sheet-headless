import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { IMPORTER_PROGRESS_EVENT } from '../types/index.js';
import type { ImporterProgressDetail } from '../types/index.js';
import { ImporterProvider } from '../providers/index.js';
import {
  useImporterEventTarget,
  useImporterProgressSubscription,
} from './useImporterEventTarget.js';

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

  it('should return progressEventTarget and subscribeToProgress', () => {
    function Consumer() {
      const { progressEventTarget, subscribeToProgress } = useImporterEventTarget();
      return (
        <div>
          <span data-testid="hasTarget">{String(progressEventTarget != null)}</span>
          <span data-testid="hasSubscribe">{String(typeof subscribeToProgress === 'function')}</span>
        </div>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    expect(screen.getByTestId('hasTarget')).toHaveTextContent('true');
    expect(screen.getByTestId('hasSubscribe')).toHaveTextContent('true');
  });

  it('should deliver progress detail to callback when subscribing and dispatching', () => {
    let received: ImporterProgressDetail | null = null;
    function Consumer() {
      const { progressEventTarget, subscribeToProgress } = useImporterEventTarget();
      const [subscribed, setSubscribed] = useState(false);
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              subscribeToProgress((d) => {
                received = d;
              });
              setSubscribed(true);
            }}
          >
            subscribe
          </button>
          <button
            type="button"
            onClick={() => {
              progressEventTarget.dispatchEvent(
                new CustomEvent(IMPORTER_PROGRESS_EVENT, {
                  detail: { phase: 'parsing', globalPercent: 25, currentRow: 10, totalRows: 100 },
                }),
              );
            }}
          >
            dispatch
          </button>
          <span data-testid="subscribed">{String(subscribed)}</span>
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
    expect(received).toEqual({
      phase: 'parsing',
      globalPercent: 25,
      currentRow: 10,
      totalRows: 100,
    });
  });

  it('should stop delivering after unsubscribe is called', () => {
    const received: ImporterProgressDetail[] = [];
    function Consumer() {
      const { progressEventTarget, subscribeToProgress } = useImporterEventTarget();
      const [unsub, setUnsub] = useState<(() => void) | null>(null);
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              const unsubscribe = subscribeToProgress((d) => received.push(d));
              setUnsub(() => unsubscribe);
            }}
          >
            subscribe
          </button>
          <button type="button" onClick={() => unsub?.()}>
            unsubscribe
          </button>
          <button
            type="button"
            onClick={() => {
              progressEventTarget.dispatchEvent(
                new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail: { phase: 'test' } }),
              );
            }}
          >
            dispatch
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
    expect(received).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'unsubscribe' }));
    fireEvent.click(screen.getByRole('button', { name: 'dispatch' }));
    expect(received).toHaveLength(1);
  });
});

describe('useImporterProgressSubscription', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useImporterProgressSubscription(() => {});
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should receive progress events when subscription is active', () => {
    const received: ImporterProgressDetail[] = [];
    function Consumer() {
      const ctx = useImporterEventTarget();
      useImporterProgressSubscription((d) => received.push(d));
      return (
        <button
          type="button"
          onClick={() => {
            ctx.progressEventTarget.dispatchEvent(
              new CustomEvent(IMPORTER_PROGRESS_EVENT, {
                detail: { phase: 'validating', globalPercent: 50 },
              }),
            );
          }}
        >
          dispatch
        </button>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'dispatch' }));
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ phase: 'validating', globalPercent: 50 });
  });
});
