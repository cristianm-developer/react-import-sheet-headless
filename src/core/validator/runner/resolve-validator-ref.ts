import type { ValidatorOrWithParams } from '../../../types/sheet-layout.js';

export interface ResolvedValidatorRef {
  readonly name: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

export function resolveValidatorRef(ref: ValidatorOrWithParams): ResolvedValidatorRef {
  if (typeof ref === 'string') return { name: ref };
  return { name: ref.name, params: ref.params };
}
