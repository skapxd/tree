import { type AstroTag } from './types';
import { VOID_ELEMENTS } from './void-elements';

export function getTag(match: RegExpExecArray): AstroTag | null {
  const rawName = match[1];
  const attrs = match[2];
  const selfClosingMarker = match[3];
  const lacksTagParts =
    rawName === undefined || attrs === undefined || selfClosingMarker === undefined;
  if (lacksTagParts) return null;

  const normalizedName = rawName.toLowerCase().replace('/', '');
  const isSelfClosing = selfClosingMarker === '/' || VOID_ELEMENTS.has(normalizedName);

  return {
    attrs,
    index: match.index,
    isSelfClosing,
    rawName,
  };
}
