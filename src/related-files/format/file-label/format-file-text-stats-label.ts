import { type RelatedFormatOptions } from '@/related-files/types';
import { formatTextStatsSuffix } from '@/shared/text-stats';
import { getFileTextStats } from './get-file-text-stats';

export function formatFileTextStatsLabel(
  file: string,
  options: RelatedFormatOptions = {}
): string {
  const stats = getFileTextStats(file);
  if (stats === null) return '';

  return ` ${formatTextStatsSuffix(stats, { color: options.color === true })}`;
}
