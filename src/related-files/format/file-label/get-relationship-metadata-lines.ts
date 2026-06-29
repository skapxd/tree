import { type RelatedEdgeMetadata } from '@/related-files/types';
import { formatLinkSourceMetadata } from './format-link-source-metadata';

export function getRelationshipMetadataLines(
  root: string,
  sourceFile: string,
  metadata?: RelatedEdgeMetadata[]
): string[] {
  const lacksMetadata = metadata === undefined || metadata.length === 0;
  if (lacksMetadata) return [];

  return metadata.map(item => formatLinkSourceMetadata(root, sourceFile, item));
}
