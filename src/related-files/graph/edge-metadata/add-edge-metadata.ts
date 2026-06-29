import { type RelatedEdgeMetadata } from '@/related-files/types';

export function addEdgeMetadata(
  edgeMetadataByFile: Map<string, Map<string, RelatedEdgeMetadata[]>>,
  fromFile: string,
  toSpecifierOrFile: string,
  metadata?: RelatedEdgeMetadata
): void {
  const lacksMetadata = metadata === undefined;
  if (lacksMetadata) return;

  const hasMetadataText = metadata.text !== undefined;
  const hasMetadataLine = metadata.line !== undefined;
  const lacksRenderableMetadata = !hasMetadataText && !hasMetadataLine;
  if (lacksRenderableMetadata) return;

  const metadataByTarget =
    edgeMetadataByFile.get(fromFile) ?? new Map<string, RelatedEdgeMetadata[]>();
  const existingMetadata = metadataByTarget.get(toSpecifierOrFile) ?? [];
  const alreadyTracked = existingMetadata.some(
    existing => existing.text === metadata.text && existing.line === metadata.line
  );

  if (!alreadyTracked) {
    existingMetadata.push(metadata);
  }

  metadataByTarget.set(toSpecifierOrFile, existingMetadata);
  edgeMetadataByFile.set(fromFile, metadataByTarget);
}
