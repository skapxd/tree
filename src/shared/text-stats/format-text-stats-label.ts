import { formatCharacterLabel } from './format-character-label';
import { formatLineLabel } from './format-line-label';
import { formatTokenEstimateLabel } from './format-token-estimate-label';
import { type TextStats } from './types';

export function formatTextStatsLabel(stats: TextStats): string {
  return [
    formatLineLabel(stats.lines),
    formatCharacterLabel(stats.characters),
    formatTokenEstimateLabel(stats.estimatedTokens),
  ].join(', ');
}
