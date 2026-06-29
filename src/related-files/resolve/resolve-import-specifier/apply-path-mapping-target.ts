import path from 'node:path';
import { type ResolverOptions } from '@/related-files/types';

export function applyPathMappingTarget(
  resolverOptions: ResolverOptions,
  target: string,
  matchedText: string
): string {
  const replacedTarget = target.includes('*') ? target.replace('*', matchedText) : target;
  return path.resolve(resolverOptions.baseUrl ?? resolverOptions.root, replacedTarget);
}
