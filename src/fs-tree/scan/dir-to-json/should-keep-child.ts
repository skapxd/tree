import { isIgnoredPath } from '@/fs-tree/ignore/is-ignored-path';
import { type IgnoreState } from '@/fs-tree/ignore/gitignore-helpers';
import { readStats } from './read-stats';

export function shouldKeepChild(
  activeIgnoreState: IgnoreState,
  childPath: string,
  child: string,
  onlyFolder: boolean | undefined
): boolean {
  const childStats = readStats(childPath);
  if (childStats === null) return false;

  const ignoredPath = isIgnoredPath(
    activeIgnoreState,
    childPath,
    child,
    childStats.isDirectory()
  );
  if (ignoredPath) return false;

  return onlyFolder === true ? childStats.isDirectory() : true;
}
