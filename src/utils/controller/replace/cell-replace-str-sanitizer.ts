import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const REPLACE_FROM_STR_SANITIZER_ID = 'replace-from-str';

type Params = { search?: string; replacement?: string };

function replaceByStr(value: unknown, search: string, replacement: string): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (search === '') return s;
  return s.split(search).join(replacement);
}

export function cellReplaceStrSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { search = '', replacement = '' } = (params ?? {}) as Params;
  const out = replaceByStr(cell.value, search, String(replacement));
  return { key: cell.key, value: out };
}

export function registerReplaceStrSanitizer(
  register: (name: string, fn: typeof cellReplaceStrSanitizer, options: { type: 'cell' }) => void
): void {
  register(REPLACE_FROM_STR_SANITIZER_ID, cellReplaceStrSanitizer, { type: 'cell' });
}
