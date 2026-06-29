import {
  type RelatedFileBranch,
  type RelatedFormatOptions,
} from '@/related-files/types';
import { formatFileNodeLabel } from '@/related-files/format/file-label';

export function formatBranchLabel(
  root: string,
  branch: RelatedFileBranch,
  options: RelatedFormatOptions = {}
): string {
  let label = formatFileNodeLabel(root, branch.file, options);
  const isCircularBranch = branch.circular === true;
  if (isCircularBranch) label += ' (cycle)';

  const isRepeatedBranch = branch.repeated === true;
  if (isRepeatedBranch) label += ' (seen)';

  return label;
}
