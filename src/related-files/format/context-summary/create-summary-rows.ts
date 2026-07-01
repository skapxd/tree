import { type RelatedContextSummary } from './types';
import {
  formatCharacterLabel,
  formatTokenEstimateLabel,
} from '@/shared/text-stats';
import { formatCount } from './format-count';
import { formatFileLabel } from './format-file-label';
import { formatLineLabel } from './format-line-label';

export function createSummaryRows(summary: RelatedContextSummary): string[] {
  const rows = [
    `files shown: ${formatFileLabel(summary.filesShown)}`,
    `related files: ${formatFileLabel(summary.relatedFiles)}`,
    `total lines: ${formatLineLabel(summary.totalLineCount)}`,
    `total chars: ${formatCharacterLabel(summary.totalCharacterCount)}`,
    `estimated tokens: ${formatTokenEstimateLabel(summary.estimatedTokenCount)}`,
    `median lines per file: ${formatLineLabel(summary.medianLineCount)}`,
    `median chars per file: ${formatCharacterLabel(summary.medianCharacterCount)}`,
    `max line length: ${formatCharacterLabel(summary.maxLineLength)}`,
    `max relationship depth: ${formatCount(summary.maxDepth)}`,
  ];
  const hasUnresolved = summary.unresolvedCount > 0;
  if (hasUnresolved) {
    rows.push(`unresolved: ${formatCount(summary.unresolvedCount)}`);
  }

  const hasFilesWithoutTextStats = summary.filesWithoutTextStats > 0;
  if (hasFilesWithoutTextStats) {
    rows.push(`files without text stats: ${formatFileLabel(summary.filesWithoutTextStats)}`);
  }

  return rows;
}
