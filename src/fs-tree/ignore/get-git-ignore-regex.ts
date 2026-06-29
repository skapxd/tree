import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_IGNORE_REGEX_PARTS,
  readGitIgnore,
  toRegexPart,
} from './gitignore-helpers';

/**
 * ## Legacy Regex Adapter
 *
 * Builds the older RegExp ignore contract from a `.gitignore` file. The main
 * tree walker uses scoped `ignore` matchers; this remains for callers that
 * still pass a single regex into the public API.
 *
 * ```text
 * .gitignore: dist/
 * output: /^dist$|.../
 * ```
 */
export function getGitIgnoreRegex(dirPath: string, includeDefaults = true): RegExp | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  const hasGitIgnore = fs.existsSync(gitIgnorePath);
  const content = hasGitIgnore ? readGitIgnore(dirPath) : null;
  const lines = content === null
    ? []
    : content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  const regexParts = [
    ...lines.map(pattern => toRegexPart(pattern)),
    ...(includeDefaults ? DEFAULT_IGNORE_REGEX_PARTS : []),
  ];
  const lacksRegexParts = regexParts.length === 0;

  return lacksRegexParts ? null : new RegExp(regexParts.join('|'));
}
