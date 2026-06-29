import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';

const readFileHelpers = {
  isNodeError(error: unknown): error is NodeJS.ErrnoException {
    const isObject = typeof error === 'object';
    const isPresent = error !== null;
    return isObject && isPresent && 'code' in error;
  },

  isMissingFileError(error: unknown): boolean {
    return readFileHelpers.isNodeError(error) && error.code === 'ENOENT';
  },

  toThrowable(error: unknown): Error {
    const isError = error instanceof Error;
    return isError ? error : new Error(String(error));
  },
};

/**
 * Reads a file from disk safely.
 */
export function readFile(filePath: string): string {
  const result = trySafe(() => fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n'));
  const isMissingFile = Result.isErr(result) && readFileHelpers.isMissingFileError(result.error);

  if (isMissingFile) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (Result.isErr(result)) {
    throw readFileHelpers.toThrowable(result.error);
  }

  return result.value;
}
