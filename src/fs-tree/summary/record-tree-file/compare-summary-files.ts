import { type TreeSummaryFile } from '@/fs-tree/summary/types';

export function compareSummaryFiles(a: TreeSummaryFile, b: TreeSummaryFile): number {
  const characterDelta = b.characters - a.characters;
  const hasDifferentCharacterCount = characterDelta !== 0;
  if (hasDifferentCharacterCount) return characterDelta;

  const lineDelta = b.lines - a.lines;
  const hasDifferentLineCount = lineDelta !== 0;
  if (hasDifferentLineCount) return lineDelta;

  return a.path.localeCompare(b.path);
}
