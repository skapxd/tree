import { formatCount } from './format-count';

export function formatFileLabel(value: number): string {
  return `${formatCount(value)} ${value === 1 ? 'file' : 'files'}`;
}
