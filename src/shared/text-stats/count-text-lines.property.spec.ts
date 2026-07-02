import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { countTextLines } from './count-text-lines';

function countNewlines(content: string): number {
  return Array.from(content).filter((char) => char === '\n').length;
}

describe('countTextLines property checks', () => {
  it('matches newline-delimited text semantics for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (content) => {
        const expectedLineCount =
          content.length === 0 || content.endsWith('\n')
            ? countNewlines(content)
            : countNewlines(content) + 1;

        expect(countTextLines(content)).toBe(expectedLineCount);
      })
    );
  });
});
