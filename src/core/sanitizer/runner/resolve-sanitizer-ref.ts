import type { ValidatorOrWithParams } from '../../../types/sheet-layout.js';

export interface ResolvedSanitizerRef {
  readonly name: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

export function resolveSanitizerRef(ref: ValidatorOrWithParams): ResolvedSanitizerRef {
  if (typeof ref === 'string') return { name: ref };
  return { name: ref.name, params: ref.params };
}
