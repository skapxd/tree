import { formatProjectPath } from '@/related-files/shared/path';
import { type SummaryStyleOptions } from '@/shared/summary-style';
import { formatTextStatsSuffix } from '@/shared/text-stats';
import { type RelatedSummaryFile } from './types';

export function formatSummaryFile(
  root: string,
  file: RelatedSummaryFile,
  options: SummaryStyleOptions = {}
): string {
  return `${formatProjectPath(root, file.file)} ${formatTextStatsSuffix(file, options)}`;
}
