import { formatCount } from './format-count';

export function formatCharacterLabel(value: number): string {
  return `${formatCount(value)} ${value === 1 ? 'char' : 'chars'}`;
}
