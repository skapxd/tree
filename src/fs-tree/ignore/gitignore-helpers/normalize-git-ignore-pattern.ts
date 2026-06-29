export function normalizeGitIgnorePattern(pattern: string): string {
  const withoutTrailingSlash = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
  return withoutTrailingSlash.startsWith('/')
    ? withoutTrailingSlash.slice(1)
    : withoutTrailingSlash;
}
