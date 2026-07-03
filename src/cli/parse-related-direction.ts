import { type RelatedFilesDirection } from '@/related-files';

export function parseRelatedDirection(value: unknown): RelatedFilesDirection {
  const usesDefaultDirection = value === true || value === undefined;
  if (usesDefaultDirection) return 'both';

  const direction = String(value);
  const isValidDirection =
    direction === 'imports' || direction === 'importers' || direction === 'both';
  if (isValidDirection) return direction;

  throw new Error(`Invalid --related mode "${direction}". Use imports, importers, or both.`);
}
