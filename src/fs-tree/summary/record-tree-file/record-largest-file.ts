import { type TreeSummary, type TreeSummaryFile } from '@/fs-tree/summary/types';
import { compareSummaryFiles } from './compare-summary-files';
import { MAX_LARGEST_FILES } from './constants';

export function recordLargestFile(summary: TreeSummary, file: TreeSummaryFile): void {
  summary.largestFiles.push(file);
  summary.largestFiles.sort(compareSummaryFiles);
  summary.largestFiles.splice(MAX_LARGEST_FILES);
}
