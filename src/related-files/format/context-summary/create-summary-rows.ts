import { type RelatedContextSummary } from './types';
import { formatCount } from './format-count';
import { formatFileLabel } from './format-file-label';
import { formatLineLabel } from './format-line-label';

export function createSummaryRows(summary: RelatedContextSummary): string[] {
  const rows = [
    `files shown: ${formatFileLabel(summary.filesShown)}`,
    `related files: ${formatFileLabel(summary.relatedFiles)}`,
    `total lines: ${formatLineLabel(summary.totalLineCount)}`,
    `median lines per file: ${formatLineLabel(summary.medianLineCount)}`,
    `max relationship depth: ${formatCount(summary.maxDepth)}`,
  ];
  const hasUnresolved = summary.unresolvedCount > 0;
  if (hasUnresolved) {
    rows.push(`unresolved: ${formatCount(summary.unresolvedCount)}`);
  }

  const hasUnreadableFiles = summary.unreadableFiles > 0;
  if (hasUnreadableFiles) {
    rows.push(`unreadable files: ${formatFileLabel(summary.unreadableFiles)}`);
  }

  return rows;
}
