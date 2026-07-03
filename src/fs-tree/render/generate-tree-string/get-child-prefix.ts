import { characters } from './characters';

export function getChildPrefix(prefix: string, isRoot: boolean, isLast: boolean): string {
  if (isRoot) return '';
  return `${prefix}${isLast ? '    ' : characters.border}`;
}
