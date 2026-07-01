import { type PathMapping } from '@/related-files/types';

export function matchesPathMappingEntry(specifier: string, mapping: PathMapping): boolean {
  return mapping.hasWildcard
    ? specifier.startsWith(mapping.prefix) && specifier.endsWith(mapping.suffix)
    : specifier === mapping.prefix;
}
