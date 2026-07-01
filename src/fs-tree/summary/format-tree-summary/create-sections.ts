import { formatFileLabel } from '@/fs-tree/summary/format-file-label';
import { formatLineLabel } from '@/fs-tree/summary/format-line-label';
import { type TreeSummary } from '@/fs-tree/summary/types';
import { getTopExtensions } from './get-top-extensions';
import { type SummarySection } from './types';

export function createSections(summary: TreeSummary): SummarySection[] {
  const shouldSkipSections = summary.onlyFolder || summary.fileCount === 0;
  if (shouldSkipSections) return [];

  const largestFiles = summary.largestFiles.map(file => {
    return `${file.path} (${formatLineLabel(file.lines)})`;
  });
  const extensions = getTopExtensions(summary).map(extension => {
    return `${extension.extension}: ${formatFileLabel(extension.count)}`;
  });

  return [
    { label: 'largest files', children: largestFiles },
    { label: 'top extensions', children: extensions },
  ].filter(section => section.children.length > 0);
}
