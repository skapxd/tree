import { formatProjectPath } from '@/related-files/shared/path';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatFileLineCountLabel } from './format-file-line-count-label';
import { getMarkdownTitle } from './get-markdown-title';

export function formatFileLabel(
  root: string,
  file: string,
  options: RelatedFormatOptions = {}
): string {
  const relativePath = formatProjectPath(root, file);
  const markdownTitle = getMarkdownTitle(file);
  const lineCountLabel = formatFileLineCountLabel(file, options);

  return markdownTitle
    ? `${relativePath} - ${markdownTitle}${lineCountLabel}`
    : `${relativePath}${lineCountLabel}`;
}
