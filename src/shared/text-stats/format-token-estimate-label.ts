import { formatCount } from './format-count';

export function formatTokenEstimateLabel(value: number): string {
  return `~${formatCount(value)} ${value === 1 ? 'token' : 'tokens'}`;
}
