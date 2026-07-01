import { type RelatedFilesResult } from '@/related-files/types';
import {
  getEstimatedTokenCount,
  getMedianCount,
} from '@/shared/text-stats';
import { collectSummaryFiles } from './collect-summary-files';
import { getLargestFiles } from './get-largest-files';
import { getMaxDepth } from './get-max-depth';
import { getTextStatEntries } from './get-text-stat-entries';
import { type RelatedContextSummary } from './types';

export function createRelatedContextSummary(result: RelatedFilesResult): RelatedContextSummary {
  const files = collectSummaryFiles(result);
  const textStatEntries = getTextStatEntries(files);
  const lineCounts = textStatEntries.map(entry => entry.lines);
  const characterCounts = textStatEntries.map(entry => entry.characters);
  const totalCharacterCount = characterCounts.reduce((total, characters) => {
    return total + characters;
  }, 0);

  return {
    filesShown: files.length,
    relatedFiles: files.length - 1,
    totalLineCount: lineCounts.reduce((total, lines) => total + lines, 0),
    totalCharacterCount,
    estimatedTokenCount: getEstimatedTokenCount(totalCharacterCount),
    medianLineCount: getMedianCount(lineCounts),
    medianCharacterCount: getMedianCount(characterCounts),
    maxLineLength: Math.max(0, ...textStatEntries.map(entry => entry.maxLineLength)),
    maxDepth: getMaxDepth(result),
    unreadableFiles: files.length - textStatEntries.length,
    unresolvedCount: result.unresolved.length,
    largestFiles: getLargestFiles(textStatEntries),
  };
}
