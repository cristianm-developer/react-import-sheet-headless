import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTransformWorker } from './useTransformWorker.js';

describe('useTransformWorker', () => {
  it('should throw when used outside ImporterProvider', () => {
    function Bad() {
      useTransformWorker();
      return null;
    }
    expect(() => render(createElement(Bad))).toThrow();
  });
});
