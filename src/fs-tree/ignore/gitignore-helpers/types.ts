import ignore from 'ignore';

export type IgnoreMatcher = ReturnType<typeof ignore>;

export type IgnoreState = {
  rootDir: string;
  customIgnore: RegExp | null;
  scopes: Array<{
    baseDir: string;
    matcher: IgnoreMatcher;
  }>;
};
