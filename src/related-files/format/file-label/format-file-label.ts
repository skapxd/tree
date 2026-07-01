import { formatProjectPath } from '@/related-files/shared/path';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatFileTextStatsLabel } from './format-file-text-stats-label';
import { getMarkdownTitle } from './get-markdown-title';

export function formatFileLabel(
  root: string,
  file: string,
  options: RelatedFormatOptions = {}
): string {
  const relativePath = formatProjectPath(root, file);
  const markdownTitle = getMarkdownTitle(file);
  const textStatsLabel = formatFileTextStatsLabel(file, options);

  return markdownTitle
    ? `${relativePath} - ${markdownTitle}${textStatsLabel}`
    : `${relativePath}${textStatsLabel}`;
}
