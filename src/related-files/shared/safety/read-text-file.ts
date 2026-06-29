import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from './absorb-recoverable-boundary-error';

export function readTextFile(filePath: string): string | null {
  const result = trySafe(() => fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n'));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
