export function isScriptTagBoundary(character: string | undefined): boolean {
  return character === undefined ||
    character === '>' ||
    character === '/' ||
    character === ' ' ||
    character === '\t' ||
    character === '\n' ||
    character === '\r' ||
    character === '\f';
}
