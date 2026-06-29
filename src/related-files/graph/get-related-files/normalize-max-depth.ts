export function normalizeMaxDepth(maxDepth?: number): number {
  if (maxDepth === undefined) return Number.POSITIVE_INFINITY;

  const isInvalidMaxDepth = !Number.isFinite(maxDepth) || maxDepth < 1;
  if (isInvalidMaxDepth) {
    throw new Error('maxDepth must be a positive number');
  }

  return Math.floor(maxDepth);
}
