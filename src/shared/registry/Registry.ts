import type { RegistryEntry, RegistryLevel } from './types.js';

export class Registry<T extends (...args: unknown[]) => unknown> {
  private entries = new Map<string, RegistryEntry<T>>();

  register(name: string, fn: T, options: { type: RegistryLevel }): void {
    this.entries.set(name, { fn, type: options.type });
  }

  get(name: string): RegistryEntry<T> | undefined {
    return this.entries.get(name);
  }

  getByType(type: RegistryLevel): Array<{ name: string; entry: RegistryEntry<T> }> {
    return [...this.entries.entries()]
      .filter(([, e]) => e.type === type)
      .map(([name, entry]) => ({ name, entry }));
  }

  has(name: string): boolean {
    return this.entries.has(name);
  }

  clear(): void {
    this.entries.clear();
  }
}
