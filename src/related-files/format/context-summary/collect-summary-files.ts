import { type RelatedFilesResult } from '@/related-files/types';
import { addUnique } from '@/related-files/shared/collections';

export function collectSummaryFiles(result: RelatedFilesResult): string[] {
  const files = [result.file];

  [...result.imports, ...result.importers].forEach(entry => {
    addUnique(files, entry.file);
  });

  return files;
}
