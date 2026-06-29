import { truncateMetadataText } from './truncate-metadata-text';

export function formatQuotedMetadataText(text: string): string {
  return `"${truncateMetadataText(text).replace(/"/g, '\\"')}"`;
}
