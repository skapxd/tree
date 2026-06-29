export {
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_IGNORE_REGEX_PARTS,
} from './constants';
export { createMatcher } from './create-matcher';
export { isInsideScope } from './is-inside-scope';
export { normalizeGitIgnorePattern } from './normalize-git-ignore-pattern';
export { readGitIgnore } from './read-git-ignore';
export { toPosixPath } from './to-posix-path';
export { toRegexPart } from './to-regex-part';
export { testRegex } from './test-regex';
export type {
  IgnoreMatcher,
  IgnoreState,
} from './types';
