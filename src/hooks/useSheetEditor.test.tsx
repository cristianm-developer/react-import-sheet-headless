import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider } from '../providers/index.js';
import { useSheetEditor } from './useSheetEditor.js';

describe('useSheetEditor', () => {
  it('should throw when used outside ImporterProvider', () => {
    function BadConsumer() {
      useSheetEditor();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useImporter must be used within an ImporterProvider',
    );
  });

  it('should return a stable editCell function', () => {
    const editCellRefs: unknown[] = [];
    function Consumer() {
      const { editCell } = useSheetEditor();
      editCellRefs.push(editCell);
      return (
        <span data-testid="count">{editCellRefs.length}</span>
      );
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
    expect(editCellRefs[0]).toBe(editCellRefs[1]);
  });

  it('should return editCell that resolves to void when called', async () => {
    let resolved: void | undefined;
    function Consumer() {
      const { editCell } = useSheetEditor();
      return (
        <button
          type="button"
          onClick={async () => {
            resolved = await editCell(0, 'email', 'test@example.com');
          }}
        >
          edit
        </button>
      );
    }
    render(
      <ImporterProvider>
        <Consumer />
      </ImporterProvider>,
    );
    const btn = screen.getByRole('button', { name: 'edit' });
    btn.click();
    await Promise.resolve();
    expect(resolved).toBeUndefined();
  });
});
