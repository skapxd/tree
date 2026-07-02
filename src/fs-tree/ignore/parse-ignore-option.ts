import { escapeRegExp } from './escape-reg-exp';

export function parseIgnoreOption(ignoreStr?: string): RegExp | null {
  const lacksIgnore = ignoreStr === undefined || ignoreStr.length === 0;
  if (lacksIgnore) return null;

  const cleanStr = ignoreStr.trim();
  const lacksPattern = cleanStr.length === 0;
  if (lacksPattern) return null;

  const alternatives = cleanStr
    .split('|')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(escapeRegExp);
  const lacksAlternatives = alternatives.length === 0;
  if (lacksAlternatives) return null;

  return new RegExp(alternatives.join('|'));
}
