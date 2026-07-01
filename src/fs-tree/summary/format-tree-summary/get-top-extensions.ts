import { MAX_EXTENSION_ROWS } from './constants';
import { type ExtensionSummary } from './types';
import { type TreeSummary } from '@/fs-tree/summary/types';

export function getTopExtensions(summary: TreeSummary): ExtensionSummary[] {
  return [...summary.extensionCounts.entries()]
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => {
      const countDelta = b.count - a.count;
      const hasDifferentCount = countDelta !== 0;
      if (hasDifferentCount) return countDelta;

      return a.extension.localeCompare(b.extension);
    })
    .slice(0, MAX_EXTENSION_ROWS);
}
