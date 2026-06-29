import { formatProjectPath } from '@/related-files/shared/path';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatFileLineCountLabel } from './format-file-line-count-label';

export function formatFileNodeLabel(
  root: string,
  file: string,
  options: RelatedFormatOptions = {}
): string {
  return `${formatProjectPath(root, file)}${formatFileLineCountLabel(file, options)}`;
}
