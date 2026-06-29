import { type RelatedFileEntry } from '@/related-files/types';

export function countTransitive(entries: RelatedFileEntry[]): number {
  return entries.filter(entry => entry.depth > 1).length;
}
