import { type ResolverOptions } from '@/related-files/types';
import { applyPathMappingTarget } from './apply-path-mapping-target';
import { isNodeModulesPath } from './is-node-modules-path';
import { matchesPathMappingEntry } from './matches-path-mapping-entry';

export function isPathMappedToNodeModules(
  specifier: string,
  resolverOptions: ResolverOptions
): boolean {
  for (const mapping of resolverOptions.pathMappings) {
    const matchesCurrentMapping = matchesPathMappingEntry(specifier, mapping);
    if (!matchesCurrentMapping) continue;

    const matchedText = specifier.slice(
      mapping.prefix.length,
      specifier.length - mapping.suffix.length
    );
    const hasNodeModulesTarget = mapping.targets.some(target =>
      isNodeModulesPath(applyPathMappingTarget(resolverOptions, target, matchedText))
    );
    if (hasNodeModulesTarget) return true;
  }

  return false;
}
