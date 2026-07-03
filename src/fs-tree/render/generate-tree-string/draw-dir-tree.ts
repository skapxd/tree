import { type TreeStructure } from '@/fs-tree/scan/dir-to-json';
import { characters } from './characters';
import { formatDirectoryName } from './format-directory-name';
import { formatFileName } from './format-file-name';
import { getBranch } from './get-branch';
import { getChildPrefix } from './get-child-prefix';
import { type DrawContext } from './types';

export function drawDirTree(
  context: DrawContext,
  name: string,
  children: (string | TreeStructure)[],
  prefix = '',
  isLast = true,
  isRoot = false
): void {
  const branch = getBranch(isRoot, isLast);
  context.lines.push(`${prefix}${branch}${formatDirectoryName(name)}`);

  const childPrefix = getChildPrefix(prefix, isRoot, isLast);

  children.forEach((child, index) => {
    const childIsLast = index === children.length - 1;
    const isFileChild = typeof child === 'string';

    if (isFileChild) {
      context.lines.push(
        `${childPrefix}${childIsLast ? characters.last : characters.contain}${formatFileName(
          child,
          context.options.color
        )}`
      );
      return;
    }

    const subName = Object.keys(child)[0];
    if (subName === undefined) return;

    const subChildren = child[subName] ?? [];
    drawDirTree(context, subName, subChildren, childPrefix, childIsLast);
  });
}
