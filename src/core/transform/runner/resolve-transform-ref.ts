import type { ValidatorOrWithParams } from '../../../types/sheet-layout.js';

export interface ResolvedTransformRef {
  readonly name: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

export function resolveTransformRef(ref: ValidatorOrWithParams): ResolvedTransformRef {
  if (typeof ref === 'string') return { name: ref };
  return { name: ref.name, params: ref.params };
}
