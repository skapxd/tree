import { formatLineLabel } from '@/fs-tree/summary/format-line-label';
import { type TreeSummary } from '@/fs-tree/summary/types';
import { getMedianLineCount } from './get-median-line-count';

export function formatMedianLineCount(summary: TreeSummary): string {
  return formatLineLabel(getMedianLineCount(summary.lineCounts));
}
