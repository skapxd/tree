import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { SUPPORTED_EXTENSIONS } from '@/related-files/constants';
import { absorbRecoverableBoundaryError } from '@/related-files/shared/safety';
import { resolveWithSubstitutedExtensions } from './resolve-with-substituted-extensions';
import { tryFile } from './try-file';

export function resolveCandidate(candidatePath: string): string | null {
  const exactFile = tryFile(candidatePath);
  if (exactFile) return exactFile;

  const extension = path.extname(candidatePath);
  const hasExplicitExtension = extension.length > 0;

  for (const supportedExtension of SUPPORTED_EXTENSIONS) {
    const resolvedFile = tryFile(`${candidatePath}${supportedExtension}`);
    if (resolvedFile) return resolvedFile;
  }

  if (hasExplicitExtension) {
    return resolveWithSubstitutedExtensions(candidatePath, extension);
  }

  const stats = trySafe(() => fs.lstatSync(candidatePath));
  if (Result.isErr(stats)) {
    absorbRecoverableBoundaryError(stats.error);
    return null;
  }

  const isDirectoryCandidate = stats.value.isDirectory();
  if (!isDirectoryCandidate) return null;

  for (const supportedExtension of SUPPORTED_EXTENSIONS) {
    const indexFile = tryFile(path.join(candidatePath, `index${supportedExtension}`));
    if (indexFile) return indexFile;
  }

  return null;
}
