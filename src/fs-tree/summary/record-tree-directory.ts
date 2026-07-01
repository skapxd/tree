import { type TreeSummary } from './types';

export function recordTreeDirectory(summary: TreeSummary): void {
  summary.directoryCount += 1;
}
