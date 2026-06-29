export const SUPPORTED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.astro',
  '.md',
  '.markdown',
] as const;

export const SUPPORTED_EXTENSION_SET = new Set<string>(SUPPORTED_EXTENSIONS);

export const DEFAULT_IGNORED_NAMES = new Set([
  '.git',
  '.DS_Store',
  'node_modules',
  'dist',
  'coverage',
  '.next',
  '.turbo',
]);

export const ANSI_DIM = '\x1b[2m';
export const ANSI_RESET = '\x1b[0m';
export const METADATA_TEXT_MAX_LENGTH = 60;
export const METADATA_TEXT_ELLIPSIS = '...';
export const METADATA_TEXT_TRUNCATED_LENGTH =
  METADATA_TEXT_MAX_LENGTH - METADATA_TEXT_ELLIPSIS.length;
