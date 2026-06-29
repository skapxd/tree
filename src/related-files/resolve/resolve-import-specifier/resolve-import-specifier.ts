import path from 'node:path';
import { isMarkdownFile } from '@/related-files/shared/path';
import { type ResolverOptions } from '@/related-files/types';
import { resolveCandidate } from '@/related-files/resolve/resolve-candidate';
import { resolveWithPathMappings } from './resolve-with-path-mappings';

export function resolveImportSpecifier(
  importerPath: string,
  specifier: string,
  resolverOptions: ResolverOptions
): string | null {
  const isMarkdownImport = isMarkdownFile(importerPath);
  const isRootRelativeMarkdownLink = isMarkdownImport && specifier.startsWith('/');
  if (isRootRelativeMarkdownLink) {
    return resolveCandidate(path.resolve(resolverOptions.root, specifier.slice(1)));
  }

  if (isMarkdownImport) {
    return resolveCandidate(path.resolve(path.dirname(importerPath), specifier));
  }

  const isRelativeImport = specifier.startsWith('.');
  if (isRelativeImport) {
    return resolveCandidate(path.resolve(path.dirname(importerPath), specifier));
  }

  const mapped = resolveWithPathMappings(specifier, resolverOptions);
  if (mapped) return mapped;

  const { baseUrl } = resolverOptions;
  const hasBaseUrl = baseUrl !== null;
  if (hasBaseUrl) {
    return resolveCandidate(path.resolve(baseUrl, specifier));
  }

  return null;
}
