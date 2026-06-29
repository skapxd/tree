import { type ResolverOptions } from '@/related-files/types';
import { matchesPathMapping } from './matches-path-mapping';

export function shouldTrackUnresolved(
  specifier: string,
  resolverOptions: ResolverOptions
): boolean {
  return specifier.startsWith('.') || matchesPathMapping(specifier, resolverOptions);
}
