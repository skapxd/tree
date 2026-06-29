import { type ResolverOptions } from '@/related-files/types';

export function matchesPathMapping(
  specifier: string,
  resolverOptions: ResolverOptions
): boolean {
  return resolverOptions.pathMappings.some(
    mapping =>
      mapping.hasWildcard
        ? specifier.startsWith(mapping.prefix) && specifier.endsWith(mapping.suffix)
        : specifier === mapping.prefix
  );
}
