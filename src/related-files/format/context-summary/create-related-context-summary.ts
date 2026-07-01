import { type RelatedFilesResult } from '@/related-files/types';
import { collectSummaryFiles } from './collect-summary-files';
import { getLargestFiles } from './get-largest-files';
import { getLineCountEntries } from './get-line-count-entries';
import { getMaxDepth } from './get-max-depth';
import { getMedianLineCount } from './get-median-line-count';
import { type RelatedContextSummary } from './types';

export function createRelatedContextSummary(result: RelatedFilesResult): RelatedContextSummary {
  const files = collectSummaryFiles(result);
  const lineCountEntries = getLineCountEntries(files);
  const lineCounts = lineCountEntries.map(entry => entry.lines);

  return {
    filesShown: files.length,
    relatedFiles: files.length - 1,
    totalLineCount: lineCounts.reduce((total, lines) => total + lines, 0),
    medianLineCount: getMedianLineCount(lineCounts),
    maxDepth: getMaxDepth(result),
    unreadableFiles: files.length - lineCountEntries.length,
    unresolvedCount: result.unresolved.length,
    largestFiles: getLargestFiles(lineCountEntries),
  };
}
