import { normalizeGitIgnorePattern } from './normalize-git-ignore-pattern';

export function toRegexPart(pattern: string): string {
  const normalized = normalizeGitIgnorePattern(pattern);
  const escaped = normalized
    .replace(/[.+?^${}()|[\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  return `^${escaped}$`;
}
