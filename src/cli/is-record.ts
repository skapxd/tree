export function isRecord(value: unknown): value is Record<string, unknown> {
  const isObject = typeof value === 'object';
  const isPresent = value !== null;
  const isArray = Array.isArray(value);
  return isObject && isPresent && !isArray;
}
