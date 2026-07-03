export function toThrowable(error: unknown): Error {
  const isError = error instanceof Error;
  return isError ? error : new Error(String(error));
}
