import { formatProjectPath } from '@/related-files/shared/path';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatFileTextStatsLabel } from './format-file-text-stats-label';

export function formatFileNodeLabel(
  root: string,
  file: string,
  options: RelatedFormatOptions = {}
): string {
  return `${formatProjectPath(root, file)}${formatFileTextStatsLabel(file, options)}`;
}
