import {
  createMatcher,
  readGitIgnore,
  type IgnoreState,
} from './gitignore-helpers';

export function withGitIgnoreForDir(state: IgnoreState, dirPath: string): IgnoreState {
  const content = readGitIgnore(dirPath);
  const lacksGitIgnore = content === null || content.length === 0;
  if (lacksGitIgnore) return state;

  const matcher = createMatcher(content);
  if (matcher === null) return state;

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
