import { isMarkdownFile } from '@/related-files/shared/path';
import { type ResolverOptions } from '@/related-files/types';
import { shouldTrackUnresolved } from './should-track-unresolved';

export function shouldTrackUnresolvedSpecifier(
  importerPath: string,
  specifier: string,
  resolverOptions: ResolverOptions
): boolean {
  const isMarkdownImport = isMarkdownFile(importerPath);
  if (isMarkdownImport) return true;

  return shouldTrackUnresolved(specifier, resolverOptions);
}
