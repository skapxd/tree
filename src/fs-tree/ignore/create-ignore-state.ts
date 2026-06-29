import ignore from 'ignore';
import {
  DEFAULT_IGNORE_PATTERNS,
  type IgnoreState,
} from './gitignore-helpers';

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
