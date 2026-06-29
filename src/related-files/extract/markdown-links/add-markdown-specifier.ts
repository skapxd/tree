import { type ExtractedSpecifier } from '@/related-files/types';
import { cleanMarkdownLinkText } from './clean-markdown-link-text';
import { createMarkdownEdgeMetadata } from './create-markdown-edge-metadata';
import { normalizeMarkdownDestination } from './normalize-markdown-destination';

export function addMarkdownSpecifier(
  specifiers: ExtractedSpecifier[],
  rawDestination: string,
  rawText: string,
  lineNumber: number
): void {
  const destination = normalizeMarkdownDestination(rawDestination);
  if (destination === null) return;

  specifiers.push({
    specifier: destination,
    metadata: createMarkdownEdgeMetadata(cleanMarkdownLinkText(rawText), lineNumber),
  });
}
