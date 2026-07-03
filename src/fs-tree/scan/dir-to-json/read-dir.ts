import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';

export function readDir(dirPath: string): string[] | null {
  const result = trySafe(() => fs.readdirSync(dirPath));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
