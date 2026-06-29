import { type RelatedEdgeMetadata } from '@/related-files/types';

export function createMarkdownEdgeMetadata(
  text: string | null,
  line: number
): RelatedEdgeMetadata {
  const metadata: RelatedEdgeMetadata = { line };
  const hasText = text !== null;
  if (hasText) {
    metadata.text = text;
  }

  return metadata;
}
