import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useParserWorker } from './useParserWorker.js';

describe('useParserWorker', () => {
  it('should throw when used outside ImporterProvider', () => {
    function Bad() {
      useParserWorker();
      return null;
    }
    expect(() => render(createElement(Bad))).toThrow(/within an ImporterProvider/);
  });
});
