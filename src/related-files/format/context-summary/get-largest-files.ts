import { MAX_LARGEST_FILES } from './constants';
import { compareSummaryFiles } from './compare-summary-files';
import { type RelatedSummaryFile } from './types';

export function getLargestFiles(files: RelatedSummaryFile[]): RelatedSummaryFile[] {
  return [...files].sort(compareSummaryFiles).slice(0, MAX_LARGEST_FILES);
}
