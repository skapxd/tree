import { type RelatedFilesResult } from '@/related-files/types';
import { appendLargestFiles } from './append-largest-files';
import { appendSummaryRows } from './append-summary-rows';
import { createRelatedContextSummary } from './create-related-context-summary';
import { createSummaryRows } from './create-summary-rows';

export function formatRelatedContextSummary(result: RelatedFilesResult): string {
  const summary = createRelatedContextSummary(result);
  const lines = ['summary'];
  const rows = createSummaryRows(summary);
  const hasLargestFiles = summary.largestFiles.length > 0;

  appendSummaryRows(lines, rows, hasLargestFiles);
  appendLargestFiles(lines, result.root, summary.largestFiles);

  return lines.join('\n');
}
