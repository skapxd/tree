import { formatCount } from '@/fs-tree/summary/format-count';
import { formatLineLabel } from '@/fs-tree/summary/format-line-label';
import { type TreeSummary } from '@/fs-tree/summary/types';
import {
  formatCharacterLabel,
  formatTokenEstimateLabel,
  getEstimatedTokenCount,
  getMedianCount,
} from '@/shared/text-stats';
import { formatMedianLineCount } from './format-median-line-count';

export function createFlatRows(summary: TreeSummary): string[] {
  if (summary.onlyFolder) {
    return [
      `directories: ${formatCount(summary.directoryCount)}`,
      'files and text stats: skipped (--only-folder)',
    ];
  }

  const rows = [
    `directories: ${formatCount(summary.directoryCount)}`,
    `files: ${formatCount(summary.fileCount)}`,
    `total lines: ${formatLineLabel(summary.totalLineCount)}`,
    `total chars: ${formatCharacterLabel(summary.totalCharacterCount)}`,
    `estimated tokens: ${formatTokenEstimateLabel(getEstimatedTokenCount(summary.totalCharacterCount))}`,
    `median lines per file: ${formatMedianLineCount(summary)}`,
    `median chars per file: ${formatCharacterLabel(getMedianCount(summary.characterCounts))}`,
    `max line length: ${formatCharacterLabel(summary.maxLineLength)}`,
  ];
  const hasUnreadableFiles = summary.unreadableFileCount > 0;
  if (hasUnreadableFiles) {
    rows.push(`unreadable files: ${formatCount(summary.unreadableFileCount)}`);
  }

  return rows;
}
