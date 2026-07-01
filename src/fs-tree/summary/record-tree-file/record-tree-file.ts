import { type TreeSummary } from '@/fs-tree/summary/types';
import { type TextStats } from '@/shared/text-stats';
import { formatRelativePath } from './format-relative-path';
import { incrementExtensionCount } from './increment-extension-count';
import { isLockFile } from './is-lock-file';
import { recordLargestFile } from './record-largest-file';

export function recordTreeFile(
  summary: TreeSummary,
  filePath: string,
  stats: TextStats | null
): void {
  summary.fileCount += 1;
  incrementExtensionCount(summary, filePath);

  const lacksTextStats = stats === null;
  if (lacksTextStats) {
    summary.fileWithoutTextStatsCount += 1;
    return;
  }

  summary.totalLineCount += stats.lines;
  summary.totalCharacterCount += stats.characters;
  summary.maxLineLength = Math.max(summary.maxLineLength, stats.maxLineLength);
  summary.lineCounts.push(stats.lines);
  summary.characterCounts.push(stats.characters);
  const shouldSkipLargestFileRanking = isLockFile(filePath);
  if (shouldSkipLargestFileRanking) return;

  recordLargestFile(summary, {
    path: formatRelativePath(summary.rootPath, filePath),
    ...stats,
  });
}
