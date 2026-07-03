export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  const isObject = typeof error === 'object';
  const isPresent = error !== null;
  return isObject && isPresent && 'code' in error;
}
