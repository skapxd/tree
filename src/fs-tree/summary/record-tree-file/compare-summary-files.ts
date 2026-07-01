import { type TreeSummaryFile } from '@/fs-tree/summary/types';

export function compareSummaryFiles(a: TreeSummaryFile, b: TreeSummaryFile): number {
  const lineDelta = b.lines - a.lines;
  const hasDifferentLineCount = lineDelta !== 0;
  if (hasDifferentLineCount) return lineDelta;

  return a.path.localeCompare(b.path);
}
