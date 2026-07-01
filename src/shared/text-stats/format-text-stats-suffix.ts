import { ANSI_DIM, ANSI_RESET } from '@/shared/summary-style/constants';
import { formatTextStatsLabel } from './format-text-stats-label';
import { type TextStats } from './types';

type TextStatsSuffixOptions = {
  color?: boolean;
};

export function formatTextStatsSuffix(
  stats: TextStats,
  options: TextStatsSuffixOptions = {}
): string {
  const suffix = `(${formatTextStatsLabel(stats)})`;
  return options.color === true ? `${ANSI_DIM}${suffix}${ANSI_RESET}` : suffix;
}
