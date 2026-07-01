import { type StaticStringScope } from './types';

export function getStaticStringBinding(
  name: string,
  scopes: StaticStringScope[]
): string[] | null {
  for (let index = scopes.length - 1; index >= 0; index -= 1) {
    const scope = scopes[index];
    if (scope === undefined) continue;
    const hasBinding = scope.has(name);
    if (hasBinding) return scope.get(name) ?? null;
  }

  return null;
}
