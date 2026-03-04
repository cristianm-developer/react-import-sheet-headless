import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('./src/core/parser/hooks/useParserWorker.js', () => ({
  useParserWorker: () => ({
    load: vi.fn().mockResolvedValue({ sheets: {} }),
    parseAll: vi.fn().mockResolvedValue({ sheets: {} }),
    dispatchProgress: vi.fn(),
    isReady: false,
  }),
}));