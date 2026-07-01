import { formatProjectPath } from '@/related-files/shared/path';
import { formatTextStatsLabel } from '@/shared/text-stats';
import { type RelatedSummaryFile } from './types';

export function formatSummaryFile(root: string, file: RelatedSummaryFile): string {
  return `${formatProjectPath(root, file.file)} (${formatTextStatsLabel(file)})`;
}
