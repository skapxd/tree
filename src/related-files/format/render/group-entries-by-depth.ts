import {
  type RelatedEntryGroup,
  type RelatedFileEntry,
  type RelatedFormatOptions,
} from '@/related-files/types';
import { formatFileLabel } from '@/related-files/format/file-label';

export function groupEntriesByDepth(
  root: string,
  entries: RelatedFileEntry[],
  options: RelatedFormatOptions = {}
): RelatedEntryGroup[] {
  const groups = new Map<number, string[]>();

  for (const entry of entries) {
    const files = groups.get(entry.depth) ?? [];
    files.push(formatFileLabel(root, entry.file, options));
    groups.set(entry.depth, files);
  }

  return Array.from(groups.entries())
    .sort(([leftDepth], [rightDepth]) => leftDepth - rightDepth)
    .map(([depth, files]) => ({
      depth,
      files: files.sort(),
    }));
}
