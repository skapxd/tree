import {
  ANSI_DIM,
  ANSI_RESET,
} from '@/related-files/constants';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatTextStatsLabel } from '@/shared/text-stats';
import { getFileTextStats } from './get-file-text-stats';

export function formatFileTextStatsLabel(
  file: string,
  options: RelatedFormatOptions = {}
): string {
  const stats = getFileTextStats(file);
  if (stats === null) return '';

  const suffix = `(${formatTextStatsLabel(stats)})`;
  return options.color ? ` ${ANSI_DIM}${suffix}${ANSI_RESET}` : ` ${suffix}`;
}
