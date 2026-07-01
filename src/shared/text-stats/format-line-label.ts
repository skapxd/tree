import { formatCount } from './format-count';

export function formatLineLabel(value: number): string {
  return `${formatCount(value)} ${value === 1 ? 'line' : 'lines'}`;
}
