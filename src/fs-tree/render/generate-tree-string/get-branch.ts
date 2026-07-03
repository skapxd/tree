import { characters } from './characters';

export function getBranch(isRoot: boolean, isLast: boolean): string {
  if (isRoot) return '';
  return isLast ? characters.last : characters.contain;
}
