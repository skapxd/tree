import {
  METADATA_TEXT_ELLIPSIS,
  METADATA_TEXT_MAX_LENGTH,
  METADATA_TEXT_TRUNCATED_LENGTH,
} from '@/related-files/constants';

export function truncateMetadataText(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const exceedsMetadataTextLimit = normalized.length > METADATA_TEXT_MAX_LENGTH;
  return exceedsMetadataTextLimit
    ? `${normalized.slice(0, METADATA_TEXT_TRUNCATED_LENGTH).trimEnd()}${METADATA_TEXT_ELLIPSIS}`
    : normalized;
}
