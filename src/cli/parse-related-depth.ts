export function parseRelatedDepth(value: unknown): number | undefined {
  const usesFullDepth = value === undefined || value === 'all';
  if (usesFullDepth) return undefined;

  const depth = Number(value);
  const isInvalidDepth = !Number.isInteger(depth) || depth < 1;
  if (isInvalidDepth) {
    throw new Error('Invalid --depth value. Use a positive integer or "all".');
  }

  return depth;
}
