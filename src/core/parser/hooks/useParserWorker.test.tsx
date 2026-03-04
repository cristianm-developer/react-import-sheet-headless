import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useParserWorker } from './useParserWorker.js';

describe('useParserWorker', () => {
  it('should return mocked parser worker API', () => {
    function Component() {
      const { load, parseAll, isReady } = useParserWorker();
      return (
        <div>
          <span data-testid="hasLoad">{String(typeof load === 'function')}</span>
          <span data-testid="hasParseAll">{String(typeof parseAll === 'function')}</span>
          <span data-testid="isReady">{String(isReady)}</span>
        </div>
      );
    }
    const { getByTestId } = render(createElement(Component));
    expect(getByTestId('hasLoad').textContent).toBe('true');
    expect(getByTestId('hasParseAll').textContent).toBe('true');
    expect(getByTestId('isReady').textContent).toBe('false');
  });
});
