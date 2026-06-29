import { getEdgeMetadata } from '@/related-files/graph/edge-metadata';
import {
  type RelatedFileBranch,
  type RelatedFilesResult,
  type RelatedFormatOptions,
} from '@/related-files/types';
import {
  getFileMetadataLines,
  getRelationshipMetadataLines,
} from '@/related-files/format/file-label';
import { formatBranchLabel } from './format-branch-label';

/**
 * ## Nested Relationship Rendering
 *
 * The related-files tree must preserve which dependency introduced each child.
 * A flat list loses that ownership, so recursive branch rendering keeps the
 * implementation path and risk path readable in large projects.
 *
 * ```text
 * controller.ts
 * └── use-case.ts
 *     └── service.ts
 * ```
 */
export function renderBranches(
  lines: string[],
  result: RelatedFilesResult,
  branches: RelatedFileBranch[],
  prefix: string,
  parentFile: string,
  direction: 'imports' | 'importers',
  options: RelatedFormatOptions = {}
): void {
  const lacksBranches = branches.length === 0;
  if (lacksBranches) {
    lines.push(`${prefix}└── (none)`);
    return;
  }

  branches.forEach((branch, index) => {
    const isLast = index === branches.length - 1;
    const sourceFile = direction === 'imports' ? parentFile : branch.file;
    const metadata = direction === 'imports'
      ? getEdgeMetadata(result.edgeMetadataByFile, parentFile, branch.file)
      : getEdgeMetadata(result.edgeMetadataByFile, branch.file, parentFile);
    const metadataLines = [
      ...getFileMetadataLines(branch.file),
      ...getRelationshipMetadataLines(result.root, sourceFile, metadata),
    ];
    const childPrefix = `${prefix}${isLast ? '    ' : '│   '}`;

    lines.push(
      `${prefix}${isLast ? '└── ' : '├── '}${formatBranchLabel(
        result.root,
        branch,
        options
      )}`
    );

    metadataLines.forEach((metadataLine, metadataIndex) => {
      const metadataIsLast =
        metadataIndex === metadataLines.length - 1 && branch.children.length === 0;
      lines.push(`${childPrefix}${metadataIsLast ? '└── ' : '├── '}${metadataLine}`);
    });

    const hasChildBranches = branch.children.length > 0;
    if (!hasChildBranches) return;

    renderBranches(
      lines,
      result,
      branch.children,
      childPrefix,
      branch.file,
      direction,
      options
    );
  });
}
