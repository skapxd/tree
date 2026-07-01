import { type RelatedFilesResult } from '@/related-files/types';

export function getMaxDepth(result: RelatedFilesResult): number {
  const depths = [...result.imports, ...result.importers].map(entry => entry.depth);
  return depths.length === 0 ? 0 : Math.max(...depths);
}
