// Public API exports
export * from './parser';
export * from './drawer';
export * from './utils';

// Re-export main functionality for programmatic use
import path from 'path';
import { dirToJson } from './parser';
import { generateTreeString } from './drawer';
import { parseIgnoreOption } from './utils';

export type TreeOptions = {
  directory: string;
  ignore?: string;
  onlyFolder?: boolean;
};

/**
 * Generates an ASCII tree string for the given directory.
 */
export function tree(options: TreeOptions): string | null {
  const ignoreRegex = parseIgnoreOption(options.ignore);
  const targetPath = path.resolve(options.directory);

  const structure = dirToJson(targetPath, ignoreRegex, options.onlyFolder);

  if (!structure) {
    return null;
  }

  return generateTreeString(structure);
}
