import { type RelatedFilesDirection } from '@/related-files/types';

export function normalizeDirection(
  direction?: RelatedFilesDirection
): RelatedFilesDirection {
  return direction ?? 'both';
}
