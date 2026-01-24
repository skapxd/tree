// Public API exports
export * from './parser';
export * from './drawer';
export * from './utils';
export * from './gitignore';

// Re-export main functionality for programmatic use
import path from 'path';
import { dirToJson } from './parser';
import { generateTreeString } from './drawer';
import { parseIgnoreOption } from './utils';

export type TreeOptions = {
  directory: string;
  ignore?: string | RegExp;
  onlyFolder?: boolean;
};

/**
 * Generates an ASCII tree string for the given directory.
 */
export function tree(options: TreeOptions): string | null {
  let ignoreRegex: RegExp | null = null;

  if (options.ignore instanceof RegExp) {
    ignoreRegex = options.ignore;
  } else {
    ignoreRegex = parseIgnoreOption(options.ignore);
  }

  const targetPath = path.resolve(options.directory);

  const structure = dirToJson(targetPath, ignoreRegex, options.onlyFolder);

  if (!structure) {
    return null;
  }

  return generateTreeString(structure);
}
