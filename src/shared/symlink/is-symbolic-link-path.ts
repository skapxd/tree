import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';

export function isSymbolicLinkPath(filePath: string): boolean {
  const result = trySafe(() => fs.lstatSync(filePath));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return false;
  }

  return result.value.isSymbolicLink();
}
