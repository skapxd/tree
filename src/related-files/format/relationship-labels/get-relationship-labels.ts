import { isMarkdownFile } from '@/related-files/shared/path';

export function getRelationshipLabels(filePath: string): {
  outgoing: string;
  incoming: string;
  unresolved: string;
  implementationSection: string;
  riskSection: string;
  directOutgoing: string;
  transitiveOutgoing: string;
  directIncoming: string;
  transitiveIncoming: string;
} {
  const isMarkdown = isMarkdownFile(filePath);
  if (isMarkdown) {
    return {
      outgoing: 'links',
      incoming: 'linked by',
      unresolved: 'unresolved local links',
      implementationSection: 'Outgoing links',
      riskSection: 'Incoming links',
      directOutgoing: 'direct links',
      transitiveOutgoing: 'transitive links',
      directIncoming: 'direct linked by',
      transitiveIncoming: 'transitive linked by',
    };
  }

  return {
    outgoing: 'imports',
    incoming: 'imported by',
    unresolved: 'unresolved local imports',
    implementationSection: 'Implementation path (imports)',
    riskSection: 'Risk surface (imported by)',
    directOutgoing: 'direct imports',
    transitiveOutgoing: 'transitive imports',
    directIncoming: 'direct importers',
    transitiveIncoming: 'transitive importers',
  };
}
