export function findTagEnd(content: string, startIndex: number): number {
  let quote: string | null = null;

  for (let index = startIndex; index < content.length; index += 1) {
    const character = content[index];
    const isInsideQuote = quote !== null;
    const closesActiveQuote = isInsideQuote && character === quote;
    if (closesActiveQuote) quote = null;
    if (isInsideQuote) continue;

    const opensQuote = character === '"' || character === "'";
    if (opensQuote) {
      quote = character;
      continue;
    }

    const reachedTagEnd = character === '>';
    if (reachedTagEnd) return index;
  }

  return -1;
}
