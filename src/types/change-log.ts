export interface ChangeLogEntryCellEdit {
  readonly type: 'cell_edit';
  readonly rowIndex: number;
  readonly cellKey: string;
  readonly value: unknown;
  readonly previousValue?: unknown;
  readonly timestamp: number;
}

export interface ChangeLogEntryRowRemove {
  readonly type: 'row_remove';
  readonly rowIndex: number;
  readonly timestamp: number;
}

export type ChangeLogEntry = ChangeLogEntryCellEdit | ChangeLogEntryRowRemove;

export function formatChangeLogAsText(entries: readonly ChangeLogEntry[]): string {
  const lines: string[] = [];
  for (const e of entries) {
    if (e.type === 'cell_edit') {
      const prev = e.previousValue !== undefined ? ` (previous: ${String(e.previousValue)})` : '';
      lines.push(
        `Row ${e.rowIndex + 1}, cell "${e.cellKey}": set to ${JSON.stringify(e.value)}${prev}`
      );
    } else {
      lines.push(`Row ${e.rowIndex + 1}: removed`);
    }
  }
  return lines.join('\n');
}
