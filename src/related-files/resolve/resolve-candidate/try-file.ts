import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { isSupportedFile } from '@/related-files/shared/path';
import { absorbRecoverableBoundaryError } from '@/related-files/shared/safety';

export function tryFile(filePath: string): string | null {
  const result = trySafe(() => fs.lstatSync(filePath));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  const isSupportedRegularFile =
    result.value.isFile() && isSupportedFile(filePath);
  if (!isSupportedRegularFile) return null;

  return path.resolve(filePath);
}
