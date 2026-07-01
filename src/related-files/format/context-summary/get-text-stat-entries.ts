import { getFileTextStats } from '@/related-files/format/file-label/get-file-text-stats';
import { type RelatedSummaryFile } from './types';

export function getTextStatEntries(files: string[]): RelatedSummaryFile[] {
  return files.flatMap(file => {
    const stats = getFileTextStats(file);
    return stats === null ? [] : [{ file, ...stats }];
  });
}
