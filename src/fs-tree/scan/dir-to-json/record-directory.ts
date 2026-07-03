import path from 'node:path';
import { recordTreeDirectory, type TreeSummary } from '@/fs-tree/summary';

export function recordDirectory(summary: TreeSummary | undefined, dirPath: string): void {
  if (summary === undefined) return;

  const reachedSummaryRoot = path.resolve(dirPath) === summary.rootPath;
  if (reachedSummaryRoot) return;

  recordTreeDirectory(summary);
}
