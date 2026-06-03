import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

type IgnoreMatcher = ReturnType<typeof ignore>;

export interface IgnoreState {
  rootDir: string;
  customIgnore: RegExp | null;
  scopes: Array<{
    baseDir: string;
    matcher: IgnoreMatcher;
  }>;
}

const DEFAULT_IGNORE_PATTERNS = ['.git', '.DS_Store'];

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function isInsideScope(scopeDir: string, filePath: string): string | null {
  const relativePath = path.relative(scopeDir, filePath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return toPosixPath(relativePath);
}

function readGitIgnore(dirPath: string): string | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  if (!fs.existsSync(gitIgnorePath)) return null;

  try {
    return fs.readFileSync(gitIgnorePath, 'utf-8');
  } catch {
    return null;
  }
}

function testRegex(regex: RegExp, value: string): boolean {
  regex.lastIndex = 0;
  return regex.test(value);
}

export function createIgnoreState(rootDir: string, customIgnore: RegExp | null): IgnoreState {
  return {
    rootDir,
    customIgnore,
    scopes: [
      {
        baseDir: rootDir,
        matcher: ignore().add(DEFAULT_IGNORE_PATTERNS),
      },
    ],
  };
}

export function withGitIgnoreForDir(state: IgnoreState, dirPath: string): IgnoreState {
  const content = readGitIgnore(dirPath);
  if (!content) return state;

  let matcher: IgnoreMatcher;
  try {
    matcher = ignore().add(content);
  } catch {
    return state;
  }

  return {
    ...state,
    scopes: [
      ...state.scopes,
      {
        baseDir: dirPath,
        matcher,
      },
    ],
  };
}

export function isIgnoredPath(
  state: IgnoreState,
  absolutePath: string,
  name: string,
  isDirectory: boolean
): boolean {
  const rootRelativePath = isInsideScope(state.rootDir, absolutePath);

  if (state.customIgnore) {
    if (testRegex(state.customIgnore, name)) return true;
    if (rootRelativePath && testRegex(state.customIgnore, rootRelativePath)) return true;
  }

  for (const scope of state.scopes) {
    const relativePath = isInsideScope(scope.baseDir, absolutePath);
    if (!relativePath) continue;

    if (isDirectory && scope.matcher.ignores(`${relativePath}/`)) {
      return true;
    }

    if (scope.matcher.ignores(relativePath)) {
      return true;
    }
  }

  return false;
}

/**
 * Reads .gitignore from the target directory and creates a RegExp for filtering.
 * NOTE: This is a simplified implementation. It handles basic patterns like:
 * - node_modules
 * - dist/
 * - *.log
 * It does NOT fully support advanced gitignore globbing (negation, nested paths).
 */
export function getGitIgnoreRegex(dirPath: string, includeDefaults = true): RegExp | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  const hasGitIgnore = fs.existsSync(gitIgnorePath);
  
  const regexParts: string[] = [];

  if (hasGitIgnore) {
    try {
      const content = fs.readFileSync(gitIgnorePath, 'utf-8');
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      lines.forEach(pattern => {
        // Remove trailing slash for directories (e.g. "dist/" -> "dist")
        let p = pattern;
        if (p.endsWith('/')) p = p.slice(0, -1);
        if (p.startsWith('/')) p = p.slice(1);

        // Escape special regex characters except *
        let escaped = p.replace(/[.+?^${}()|[\\]/g, '\\$&');

        // Convert glob * to regex .*
        escaped = escaped.replace(/\*/g, '.*');

        regexParts.push(`^${escaped}$`);
      });
    } catch {
      // ignore
    }
  }

  // Always add .git and .DS_Store if defaults are requested
  if (includeDefaults) {
    regexParts.push('^\\.git$');
    regexParts.push('^\\.DS_Store$');
  }

  if (regexParts.length === 0) return null;

  return new RegExp(regexParts.join('|'));
}
