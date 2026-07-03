import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';

export function readStats(filePath: string): fs.Stats | null {
  const result = trySafe(() => fs.lstatSync(filePath));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
