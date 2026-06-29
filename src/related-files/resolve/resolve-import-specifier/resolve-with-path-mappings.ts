import { resolveCandidate } from '@/related-files/resolve/resolve-candidate';
import { type ResolverOptions } from '@/related-files/types';
import { applyPathMappingTarget } from './apply-path-mapping-target';

export function resolveWithPathMappings(
  specifier: string,
  resolverOptions: ResolverOptions
): string | null {
  for (const mapping of resolverOptions.pathMappings) {
    const matchesMapping = mapping.hasWildcard
      ? specifier.startsWith(mapping.prefix) && specifier.endsWith(mapping.suffix)
      : specifier === mapping.prefix;
    if (!matchesMapping) continue;

    const matchedText = specifier.slice(
      mapping.prefix.length,
      specifier.length - mapping.suffix.length
    );

    for (const target of mapping.targets) {
      const resolved = resolveCandidate(
        applyPathMappingTarget(resolverOptions, target, matchedText)
      );
      if (resolved) return resolved;
    }
  }

  return null;
}
