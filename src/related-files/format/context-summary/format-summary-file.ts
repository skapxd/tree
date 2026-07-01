import { formatProjectPath } from '@/related-files/shared/path';
import { formatLineLabel } from './format-line-label';
import { type RelatedSummaryFile } from './types';

export function formatSummaryFile(root: string, file: RelatedSummaryFile): string {
  return `${formatProjectPath(root, file.file)} (${formatLineLabel(file.lines)})`;
}
