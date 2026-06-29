import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { absorbRecoverableBoundaryError } from './absorb-recoverable-boundary-error';

export function readGitIgnore(dirPath: string): string | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  const hasGitIgnore = fs.existsSync(gitIgnorePath);
  if (!hasGitIgnore) return null;

  const result = trySafe(() => fs.readFileSync(gitIgnorePath, 'utf-8'));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
