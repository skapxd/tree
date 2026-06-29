import {
  type RelatedFilesResult,
  type RelatedFormatOptions,
} from '@/related-files/types';
import { formatFileLabel } from './file-label';
import { getRelationshipLabels } from './relationship-labels';
import {
  renderLayeredSection,
  renderSummaryNotes,
  renderSummaryUnresolved,
} from './render';

export function formatRelatedFilesSummary(
  result: RelatedFilesResult,
  options: RelatedFormatOptions = {}
): string {
  const lines = [
    `Related files for ${formatFileLabel(result.root, result.file, options)}`,
  ];
  const labels = getRelationshipLabels(result.file);
  const shouldRenderImports = result.direction === 'both' || result.direction === 'imports';
  const shouldRenderImporters = result.direction === 'both' || result.direction === 'importers';

  if (shouldRenderImports) {
    lines.push('');
    renderLayeredSection(
      lines,
      labels.implementationSection,
      labels.directOutgoing,
      labels.transitiveOutgoing,
      result.root,
      result.imports,
      options
    );
  }

  if (shouldRenderImporters) {
    lines.push('');
    renderLayeredSection(
      lines,
      labels.riskSection,
      labels.directIncoming,
      labels.transitiveIncoming,
      result.root,
      result.importers,
      options
    );
  }

  renderSummaryUnresolved(
    lines,
    result.root,
    result.unresolved,
    labels.unresolved,
    options
  );
  renderSummaryNotes(lines, result);

  return lines.join('\n');
}
