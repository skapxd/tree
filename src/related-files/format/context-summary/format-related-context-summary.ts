import { type RelatedFilesResult } from '@/related-files/types';
import { type SummaryStyleOptions } from '@/shared/summary-style';
import { appendLargestFiles } from './append-largest-files';
import { appendSummaryRows } from './append-summary-rows';
import { createRelatedContextSummary } from './create-related-context-summary';
import { createSummaryRows } from './create-summary-rows';

export function formatRelatedContextSummary(
  result: RelatedFilesResult,
  options: SummaryStyleOptions = {}
): string {
  const summary = createRelatedContextSummary(result);
  const lines = ['summary'];
  const rows = createSummaryRows(summary);
  const hasLargestFiles = summary.largestFiles.length > 0;

  appendSummaryRows(lines, rows, hasLargestFiles, options);
  appendLargestFiles(lines, result.root, summary.largestFiles, options);

  return lines.join('\n');
}
