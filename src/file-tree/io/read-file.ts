import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { isMissingFileError } from './read-file/is-missing-file-error';
import { toThrowable } from './read-file/to-throwable';

/**
 * Reads a file from disk safely.
 */
export function readFile(filePath: string): string {
  const result = trySafe(() => fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n'));
  const isMissingFile = Result.isErr(result) && isMissingFileError(result.error);

  if (isMissingFile) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (Result.isErr(result)) {
    throw toThrowable(result.error);
  }

  return result.value;
}
