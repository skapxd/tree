import { formatProjectPath } from '@/related-files/shared/path';
import { type RelatedEdgeMetadata } from '@/related-files/types';
import { formatQuotedMetadataText } from './format-quoted-metadata-text';

export function formatLinkSourceMetadata(
  root: string,
  sourceFile: string,
  metadata: RelatedEdgeMetadata
): string {
  const sourcePath = formatProjectPath(root, sourceFile);
  const sourceLocation = metadata.line === undefined
    ? sourcePath
    : `${sourcePath}:${metadata.line}`;
  const text = metadata.text === undefined
    ? ''
    : ` ${formatQuotedMetadataText(metadata.text)}`;

  return `link source: ${sourceLocation}${text}`;
}
