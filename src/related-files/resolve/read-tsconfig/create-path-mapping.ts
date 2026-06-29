import { isString } from '@/related-files/shared/safety';
import { type PathMapping } from '@/related-files/types';

export function createPathMapping(alias: string, rawTargets: unknown): PathMapping | null {
  const hasTargetList = Array.isArray(rawTargets);
  if (!hasTargetList) return null;

  const targets = rawTargets.filter(isString);
  const lacksUsableTargets = targets.length === 0;
  if (lacksUsableTargets) return null;

  const starIndex = alias.indexOf('*');
  const hasWildcard = starIndex >= 0;
  const prefix = hasWildcard ? alias.slice(0, starIndex) : alias;
  const suffix = hasWildcard ? alias.slice(starIndex + 1) : '';

  return { prefix, suffix, targets, hasWildcard };
}
