import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import {
  type IgnoreState,
  withGitIgnoreForDir,
} from '@/fs-tree/gitignore';
import { absorbRecoverableBoundaryError } from '@/related-files/shared/safety';

export function readDirectory(currentPath: string, state: IgnoreState): {
  activeState: IgnoreState;
  entries: string[];
} | null {
  const result = trySafe(() => ({
    activeState: withGitIgnoreForDir(state, currentPath),
    entries: fs.readdirSync(currentPath).sort(),
  }));

  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
