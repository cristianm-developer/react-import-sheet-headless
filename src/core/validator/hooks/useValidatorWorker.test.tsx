import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useValidatorWorker } from './useValidatorWorker.js';

describe('useValidatorWorker', () => {
  it('should throw when used outside ImporterProvider', () => {
    function Bad() {
      useValidatorWorker();
      return null;
    }
    expect(() => render(createElement(Bad))).toThrow();
  });
});
