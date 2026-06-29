import { formatFileLabel } from '@/related-files/format/file-label';
import {
  type RelatedFileEntry,
  type RelatedFormatOptions,
} from '@/related-files/types';

export function toProjectPathList(
  root: string,
  entries: RelatedFileEntry[],
  options: RelatedFormatOptions = {}
): string[] {
  return entries.map(entry => formatFileLabel(root, entry.file, options));
}
