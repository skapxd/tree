import { type TreeSummary } from '@/fs-tree/summary/types';
import { getExtension } from './get-extension';

export function incrementExtensionCount(summary: TreeSummary, filePath: string): void {
  const extension = getExtension(filePath);
  const currentCount = summary.extensionCounts.get(extension) ?? 0;
  summary.extensionCounts.set(extension, currentCount + 1);
}
