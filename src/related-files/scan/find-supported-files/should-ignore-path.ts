import path from 'node:path';
import {
  isIgnoredPath,
  type IgnoreState,
} from '@/fs-tree/gitignore';
import { DEFAULT_IGNORED_NAMES } from '@/related-files/constants';
import { toPosixPath } from '@/related-files/shared/path';
import { testRegex } from './test-regex';

export function shouldIgnorePath(
  state: IgnoreState,
  root: string,
  absolutePath: string,
  name: string,
  isDirectory: boolean,
  customIgnore: RegExp | null
): boolean {
  const isDefaultIgnoredName = DEFAULT_IGNORED_NAMES.has(name);
  if (isDefaultIgnoredName) return true;

  const relativePath = toPosixPath(path.relative(root, absolutePath));
  const hasCustomIgnore = customIgnore !== null;
  const hasRelativePath = relativePath.length > 0;

  if (!hasCustomIgnore) return isIgnoredPath(state, absolutePath, name, isDirectory);

  const ignoredByNamePattern = testRegex(customIgnore, name);
  if (ignoredByNamePattern) return true;

  const ignoredByRelativePathPattern =
    hasRelativePath && testRegex(customIgnore, relativePath);
  if (ignoredByRelativePathPattern) return true;

  return isIgnoredPath(state, absolutePath, name, isDirectory);
}
