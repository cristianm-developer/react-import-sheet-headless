export function normalize(s: string): string {
  const t = s.trim().toLowerCase();
  return t.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1]! + 1,
        prev[j]! + 1,
        prev[j - 1]! + cost,
      );
    }
    prev = curr;
  }
  return prev[b.length]!;
}

export function getSimilarity(s1: string, s2: string): number {
  const a = normalize(s1);
  const b = normalize(s2);
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length < b.length ? a : b;
  if (longer.length === 0) return 1;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

const DEFAULT_FUZZY_THRESHOLD = 0.8;

export interface MapHeadersOptions {
  threshold?: number;
}

export interface MapHeadersItem {
  key: string;
  matchedHeader: string | null;
}

export function mapHeaders(
  rawHeaders: string[],
  expectedKeys: string[],
  options: MapHeadersOptions = {},
): MapHeadersItem[] {
  const threshold = options.threshold ?? DEFAULT_FUZZY_THRESHOLD;
  const keyScores: { key: string; header: string; score: number }[] = [];
  for (const key of expectedKeys) {
    for (const header of rawHeaders) {
      const score = getSimilarity(key, header);
      if (score >= threshold) {
        keyScores.push({ key, header, score });
      }
    }
  }
  keyScores.sort((x, y) => y.score - x.score);

  const assignedKeys = new Set<string>();
  const assignedHeaders = new Set<string>();
  const keyToHeader: Record<string, string | null> = {};
  for (const k of expectedKeys) {
    keyToHeader[k] = null;
  }
  for (const { key, header, score: _ } of keyScores) {
    if (assignedKeys.has(key) || assignedHeaders.has(header)) continue;
    keyToHeader[key] = header;
    assignedKeys.add(key);
    assignedHeaders.add(header);
  }

  return expectedKeys.map((key) => ({
    key,
    matchedHeader: keyToHeader[key] ?? null,
  }));
}
