import { recordTreeFile, type TreeSummary } from '@/fs-tree/summary';
import { type TextStats } from '@/shared/text-stats';

export function recordFile(
  summary: TreeSummary | undefined,
  filePath: string,
  stats: TextStats | null
): void {
  if (summary === undefined) return;

  recordTreeFile(summary, filePath, stats);
}
