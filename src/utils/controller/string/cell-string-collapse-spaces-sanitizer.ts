import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const STRING_COLLAPSE_SPACES_SANITIZER_ID = 'string:spaces';

function collapseSpaces(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

export function cellStringCollapseSpacesSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  _params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  return { key: cell.key, value: collapseSpaces(cell.value) };
}

export function registerStringCollapseSpacesSanitizer(
  register: (
    name: string,
    fn: typeof cellStringCollapseSpacesSanitizer,
    options: { type: 'cell' }
  ) => void
): void {
  register(STRING_COLLAPSE_SPACES_SANITIZER_ID, cellStringCollapseSpacesSanitizer, {
    type: 'cell',
  });
}
