import { getAstroScriptType } from './get-astro-script-type';

const JAVASCRIPT_TYPES = new Set([
  'application/ecmascript',
  'application/javascript',
  'module',
  'text/ecmascript',
  'text/javascript',
  'text/typescript',
]);

export function shouldParseAstroScript(attrs: string): boolean {
  const hasSourceAttribute = /(?:^|\s)src(?:\s*=|\s|$)/i.test(attrs);
  if (hasSourceAttribute) return false;

  const type = getAstroScriptType(attrs);
  const hasImplicitJavaScriptType = type === null;
  if (hasImplicitJavaScriptType) return true;

  return JAVASCRIPT_TYPES.has(type);
}
