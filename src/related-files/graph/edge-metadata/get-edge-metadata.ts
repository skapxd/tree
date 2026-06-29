import { type RelatedEdgeMetadata } from '@/related-files/types';

export function getEdgeMetadata(
  edgeMetadataByFile: Map<string, Map<string, RelatedEdgeMetadata[]>>,
  fromFile: string,
  toSpecifierOrFile: string
): RelatedEdgeMetadata[] | undefined {
  return edgeMetadataByFile.get(fromFile)?.get(toSpecifierOrFile);
}
