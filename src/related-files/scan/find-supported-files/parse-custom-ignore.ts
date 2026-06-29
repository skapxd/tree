import { parseIgnoreOption } from '@/fs-tree/utils';

export function parseCustomIgnore(ignore?: string | RegExp): RegExp | null {
  const lacksIgnore = ignore === undefined || ignore === '';
  if (lacksIgnore) return null;

  const isRegexIgnore = ignore instanceof RegExp;
  if (isRegexIgnore) return ignore;

  return parseIgnoreOption(ignore);
}
