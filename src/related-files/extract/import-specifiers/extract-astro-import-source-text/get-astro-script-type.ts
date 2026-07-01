export function getAstroScriptType(attrs: string): string | null {
  const typeMatch = attrs.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  return typeMatch?.[1]?.toLowerCase()
    ?? typeMatch?.[2]?.toLowerCase()
    ?? typeMatch?.[3]?.toLowerCase()
    ?? null;
}
