import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSanitizerWorker } from './useSanitizerWorker.js';

describe('useSanitizerWorker', () => {
  it('should throw when used outside ImporterProvider', () => {
    function Bad() {
      useSanitizerWorker();
      return null;
    }
    expect(() => render(createElement(Bad))).toThrow(/within an ImporterProvider/);
  });
});
