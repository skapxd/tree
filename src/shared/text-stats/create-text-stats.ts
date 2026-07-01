import { countTextLines } from './count-text-lines';
import { getEstimatedTokenCount } from './get-estimated-token-count';
import { getMaxLineLength } from './get-max-line-length';
import { type TextStats } from './types';

export function createTextStats(content: string): TextStats {
  const characters = content.length;

  return {
    lines: countTextLines(content),
    characters,
    estimatedTokens: getEstimatedTokenCount(characters),
    maxLineLength: getMaxLineLength(content),
  };
}
