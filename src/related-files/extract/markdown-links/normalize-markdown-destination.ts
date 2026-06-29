import { decodeMarkdownDestination } from './decode-markdown-destination';
import { stripMarkdownFragmentAndQuery } from './strip-markdown-fragment-and-query';

/**
 * ## Local Markdown Link Target
 *
 * Markdown accepts links with titles, angle brackets, fragments, queries and
 * absolute URLs. Related-file mode only needs local file targets, so this
 * normalizes the useful path segment and rejects anything that cannot become a
 * local dependency edge.
 *
 * ```text
 * [Guide](./guide.md#intro "title") -> ./guide.md
 * [Site](https://example.com) -> ignored
 * ```
 */
export function normalizeMarkdownDestination(rawDestination: string): string | null {
  const trimmed = rawDestination.trim();
  const lacksDestination = trimmed.length === 0;
  if (lacksDestination) return null;

  let destination = trimmed;
  const isAngleWrappedDestination = destination.startsWith('<');
  const closingIndex = destination.indexOf('>');
  const lacksClosingAngle = isAngleWrappedDestination && closingIndex < 0;
  if (lacksClosingAngle) return null;

  if (isAngleWrappedDestination) {
    destination = destination.slice(1, closingIndex);
  }

  if (!isAngleWrappedDestination) {
    destination = destination.split(/\s+/)[0] ?? '';
  }

  destination = stripMarkdownFragmentAndQuery(
    decodeMarkdownDestination(destination.trim())
  );
  const lacksLocalDestination = destination.length === 0 || destination.startsWith('#');
  if (lacksLocalDestination) return null;

  const hasUrlScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(destination);
  if (hasUrlScheme) return null;

  const isProtocolRelativeUrl = destination.startsWith('//');
  if (isProtocolRelativeUrl) return null;

  return destination;
}
