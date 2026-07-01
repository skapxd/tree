import { getFileLineCount } from '@/related-files/format/file-label/get-file-line-count';
import { type RelatedSummaryFile } from './types';

export function getLineCountEntries(files: string[]): RelatedSummaryFile[] {
  return files.flatMap(file => {
    const lines = getFileLineCount(file);
    return lines === null ? [] : [{ file, lines }];
  });
}
