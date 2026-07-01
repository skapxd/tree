import {
  type RelatedFilesResult,
  type RelatedFormatOptions,
} from '@/related-files/types';
import { formatFileLabel } from './file-label';
import { formatRelatedContextSummary } from './context-summary';
import { getRelationshipLabels } from './relationship-labels';
import {
  renderBranches,
  renderUnresolved,
} from './render';

/**
 * ## Full Relationship Tree
 *
 * Use the nested tree when a flat summary would hide ownership: each child is
 * rendered below the file that introduced it, so risk and implementation paths
 * keep their dependency chain.
 *
 * ```text
 * input: controller.ts imports use-case.ts imports service.ts
 * output: controller.ts -> use-case.ts -> service.ts
 * ```
 */
export function formatRelatedFilesTree(
  result: RelatedFilesResult,
  options: RelatedFormatOptions = {}
): string {
  const lines = [
    `Related files for ${formatFileLabel(result.root, result.file, options)}`,
  ];
  const labels = getRelationshipLabels(result.file);
  const shouldRenderImports = result.direction === 'imports' || result.direction === 'both';
  const shouldRenderImporters = result.direction === 'importers' || result.direction === 'both';
  const hasUnresolved = result.unresolved.length > 0;
  const groups: Array<{
    label: string;
    render: (prefix: string) => void;
  }> = [];

  if (shouldRenderImports) {
    groups.push({
      label: `${labels.outgoing} (${result.imports.length})`,
      render: prefix => renderBranches(
        lines,
        result,
        result.importTree,
        prefix,
        result.file,
        'imports',
        options
      ),
    });
  }

  if (shouldRenderImporters) {
    groups.push({
      label: `${labels.incoming} (${result.importers.length})`,
      render: prefix => renderBranches(
        lines,
        result,
        result.importerTree,
        prefix,
        result.file,
        'importers',
        options
      ),
    });
  }

  if (hasUnresolved) {
    groups.push({
      label: `${labels.unresolved} (${result.unresolved.length})`,
      render: prefix => renderUnresolved(
        lines,
        result.root,
        result.unresolved,
        prefix,
        options
      ),
    });
  }

  groups.forEach((group, index) => {
    const isLast = index === groups.length - 1;
    lines.push(`${isLast ? '└── ' : '├── '}${group.label}`);
    group.render(isLast ? '    ' : '│   ');
  });

  lines.push('', formatRelatedContextSummary(result, { color: options.color === true }));

  return lines.join('\n');
}
