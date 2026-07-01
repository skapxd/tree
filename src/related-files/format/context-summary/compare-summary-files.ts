import { type RelatedSummaryFile } from './types';

export function compareSummaryFiles(a: RelatedSummaryFile, b: RelatedSummaryFile): number {
  const lineDelta = b.lines - a.lines;
  const hasDifferentLineCount = lineDelta !== 0;
  if (hasDifferentLineCount) return lineDelta;

  return a.file.localeCompare(b.file);
}
