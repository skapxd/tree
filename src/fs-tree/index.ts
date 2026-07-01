// Public API exports
export * from './parser';
export * from './drawer';
export * from './utils';
export * from './gitignore';

// Re-export main functionality for programmatic use
import path from 'node:path';
import { dirToJson } from './parser';
import { generateTreeString } from './drawer';
import { parseIgnoreOption } from './utils';
import { createTreeSummary } from './summary';

export type TreeOptions = {
  directory: string;
  ignore?: string | RegExp;
  onlyFolder?: boolean;
  color?: boolean;
  includeSummary?: boolean;
};

/**
 * Generates an ASCII tree string for the given directory.
 */
export function tree(options: TreeOptions): string | null {
  const ignoreOption = options.ignore;
  const hasRegexIgnore = ignoreOption instanceof RegExp;
  const ignorePattern = typeof ignoreOption === 'string' ? ignoreOption : undefined;
  const ignoreRegex = hasRegexIgnore
    ? ignoreOption
    : parseIgnoreOption(ignorePattern);

  const targetPath = path.resolve(options.directory);
  const shouldIncludeSummary = options.includeSummary === true;
  const summary = shouldIncludeSummary
    ? createTreeSummary(targetPath, options.onlyFolder === true)
    : undefined;

  const structure = dirToJson(targetPath, ignoreRegex, options.onlyFolder, undefined, summary);

  const lacksStructure = structure === null;
  if (lacksStructure) return null;

  return generateTreeString(structure, {
    color: Boolean(options.color),
    ...(summary === undefined ? {} : { summary }),
  });
}
