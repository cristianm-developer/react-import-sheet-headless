import type {
  ConvertedSheetCell,
  ConvertedSheetRow,
} from '../../../core/convert/types/converted-sheet.js';

export const REPLACE_FROM_REGEX_SANITIZER_ID = 'replace-from-regex';

type Params = { pattern?: string; flags?: string; replacement?: string };

function replaceByRegex(
  value: unknown,
  pattern: string,
  flags: string,
  replacement: string
): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (!pattern) return s;
  try {
    const re = new RegExp(pattern, flags);
    return s.replace(re, replacement);
  } catch {
    return s;
  }
}

export function cellReplaceRegexSanitizer(
  cell: ConvertedSheetCell,
  _row: ConvertedSheetRow,
  params?: Readonly<Record<string, unknown>>
): ConvertedSheetCell {
  const { pattern = '', flags = 'g', replacement = '' } = (params ?? {}) as Params;
  const out = replaceByRegex(cell.value, pattern, flags, String(replacement));
  return { key: cell.key, value: out };
}

export function registerReplaceRegexSanitizer(
  register: (name: string, fn: typeof cellReplaceRegexSanitizer, options: { type: 'cell' }) => void
): void {
  register(REPLACE_FROM_REGEX_SANITIZER_ID, cellReplaceRegexSanitizer, { type: 'cell' });
}
