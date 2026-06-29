import {
  isInsideScope,
  testRegex,
  type IgnoreState,
} from './gitignore-helpers';

export function isIgnoredPath(
  state: IgnoreState,
  absolutePath: string,
  name: string,
  isDirectory: boolean
): boolean {
  const rootRelativePath = isInsideScope(state.rootDir, absolutePath);
  const { customIgnore } = state;
  const hasCustomIgnore = customIgnore !== null;

  const ignoredByName =
    hasCustomIgnore && testRegex(customIgnore, name);
  if (ignoredByName) return true;

  const ignoredByRootPath =
    hasCustomIgnore &&
    rootRelativePath !== null &&
    testRegex(customIgnore, rootRelativePath);
  if (ignoredByRootPath) return true;

  for (const scope of state.scopes) {
    const relativePath = isInsideScope(scope.baseDir, absolutePath);
    if (relativePath === null) continue;

    const ignoredDirectory = isDirectory && scope.matcher.ignores(`${relativePath}/`);
    if (ignoredDirectory) return true;

    const ignoredPath = scope.matcher.ignores(relativePath);
    if (ignoredPath) return true;
  }

  return false;
}
