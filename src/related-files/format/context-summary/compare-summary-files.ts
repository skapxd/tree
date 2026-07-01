import { type RelatedSummaryFile } from './types';

export function compareSummaryFiles(a: RelatedSummaryFile, b: RelatedSummaryFile): number {
  const characterDelta = b.characters - a.characters;
  const hasDifferentCharacterCount = characterDelta !== 0;
  if (hasDifferentCharacterCount) return characterDelta;

  const lineDelta = b.lines - a.lines;
  const hasDifferentLineCount = lineDelta !== 0;
  if (hasDifferentLineCount) return lineDelta;

  return a.file.localeCompare(b.file);
}
