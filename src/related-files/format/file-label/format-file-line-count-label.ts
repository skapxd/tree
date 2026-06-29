import { isMarkdownFile } from '@/related-files/shared/path';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatLineCountSuffix } from './format-line-count-suffix';
import { getFileLineCount } from './get-file-line-count';

export function formatFileLineCountLabel(
  file: string,
  options: RelatedFormatOptions = {}
): string {
  const lineCount = isMarkdownFile(file)
    ? getFileLineCount(file)
    : null;
  return lineCount === null ? '' : ` ${formatLineCountSuffix(lineCount, options)}`;
}
