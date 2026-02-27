export type RegistryLevel = 'cell' | 'row' | 'table';

export interface RegistryEntry<T extends (...args: unknown[]) => unknown> {
  readonly fn: T;
  readonly type: RegistryLevel;
}
