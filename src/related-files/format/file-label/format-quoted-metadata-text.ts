import { truncateMetadataText } from './truncate-metadata-text';

export function formatQuotedMetadataText(text: string): string {
  return JSON.stringify(truncateMetadataText(text));
}
