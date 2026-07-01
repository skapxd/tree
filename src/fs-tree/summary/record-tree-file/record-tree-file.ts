import { type TreeSummary } from '@/fs-tree/summary/types';
import { formatRelativePath } from './format-relative-path';
import { incrementExtensionCount } from './increment-extension-count';
import { isLockFile } from './is-lock-file';
import { recordLargestFile } from './record-largest-file';

export function recordTreeFile(
  summary: TreeSummary,
  filePath: string,
  lineCount: number | null
): void {
  summary.fileCount += 1;
  incrementExtensionCount(summary, filePath);

  const lacksLineCount = lineCount === null;
  if (lacksLineCount) {
    summary.unreadableFileCount += 1;
    return;
  }

  summary.totalLineCount += lineCount;
  summary.lineCounts.push(lineCount);
  const shouldSkipLargestFileRanking = isLockFile(filePath);
  if (shouldSkipLargestFileRanking) return;

  recordLargestFile(summary, {
    path: formatRelativePath(summary.rootPath, filePath),
    lines: lineCount,
  });
}
