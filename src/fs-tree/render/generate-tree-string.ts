import { type TreeStructure } from '@/fs-tree/scan/dir-to-json';
import { formatTreeSummary } from '@/fs-tree/summary';
import { drawDirTree } from './generate-tree-string/draw-dir-tree';
import { type DrawContext, type DrawOptions } from './generate-tree-string/types';

export type { DrawOptions } from './generate-tree-string/types';

/**
 * Main entry point to generate the tree string.
 */
export function generateTreeString(structure: TreeStructure, options: DrawOptions = {}): string {
  const isSingleFile = typeof structure === 'string';
  if (isSingleFile) return structure;

  const rootName = Object.keys(structure)[0];
  if (rootName === undefined) return '';

  const context: DrawContext = { lines: [], options };
  const children = structure[rootName] ?? [];
  drawDirTree(context, rootName, children, '', true, true);

  if (options.summary !== undefined) {
    context.lines.push('', formatTreeSummary(options.summary, { color: options.color === true }));
  }

  return context.lines.join('\n');
}
