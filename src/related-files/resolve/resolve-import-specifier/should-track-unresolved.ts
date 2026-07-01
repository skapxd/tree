import { type ResolverOptions } from '@/related-files/types';
import { hasExplicitUnsupportedExtension } from './has-explicit-unsupported-extension';
import { isPathMappedToNodeModules } from './is-path-mapped-to-node-modules';
import { matchesPathMapping } from './matches-path-mapping';

export function shouldTrackUnresolved(
  specifier: string,
  resolverOptions: ResolverOptions
): boolean {
  const isKnownUnsupportedAsset = hasExplicitUnsupportedExtension(specifier);
  if (isKnownUnsupportedAsset) return false;

  const isNodeModulesAlias = isPathMappedToNodeModules(specifier, resolverOptions);
  if (isNodeModulesAlias) return false;

  return specifier.startsWith('.') || matchesPathMapping(specifier, resolverOptions);
}
