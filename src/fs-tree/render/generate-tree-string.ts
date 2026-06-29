import { type TreeStructure } from '@/fs-tree/scan/dir-to-json';

export type DrawOptions = {
  color?: boolean;
};

type DrawContext = {
  lines: string[];
  options: DrawOptions;
};

const characters = {
  border: '│   ',
  contain: '├── ',
  last: '└── ',
};

const LINE_COUNT_SUFFIX_REGEX = /^(.*) \((\d+ lines?)\)$/;
const ANSI_DIM = '\x1b[2m';
const ANSI_RESET = '\x1b[0m';

const generateTreeStringHelpers = {
  formatDirectoryName(name: string): string {
    return name.endsWith('/') ? name : `${name}/`;
  },

  formatFileName(name: string, color = false): string {
    const match = name.match(LINE_COUNT_SUFFIX_REGEX);
    if (match === null) return name;

    const fileName = match[1];
    const lineCount = match[2];
    const lacksLineCountMatch = fileName === undefined || lineCount === undefined;
    if (lacksLineCountMatch) return name;

    const lineCountSuffix = `(${lineCount})`;
    return `${fileName} ${color ? `${ANSI_DIM}${lineCountSuffix}${ANSI_RESET}` : lineCountSuffix}`;
  },

  getBranch(isRoot: boolean, isLast: boolean): string {
    if (isRoot) return '';
    return isLast ? characters.last : characters.contain;
  },

  getChildPrefix(prefix: string, isRoot: boolean, isLast: boolean): string {
    if (isRoot) return '';
    return `${prefix}${isLast ? '    ' : characters.border}`;
  },

  drawDirTree(
    context: DrawContext,
    name: string,
    children: (string | TreeStructure)[],
    prefix = '',
    isLast = true,
    isRoot = false
  ): void {
    const branch = generateTreeStringHelpers.getBranch(isRoot, isLast);
    context.lines.push(`${prefix}${branch}${generateTreeStringHelpers.formatDirectoryName(name)}`);

    const childPrefix = generateTreeStringHelpers.getChildPrefix(prefix, isRoot, isLast);

    children.forEach((child, index) => {
      const childIsLast = index === children.length - 1;
      const isFileChild = typeof child === 'string';

      if (isFileChild) {
        context.lines.push(
          `${childPrefix}${childIsLast ? characters.last : characters.contain}${generateTreeStringHelpers.formatFileName(
            child,
            context.options.color
          )}`
        );
        return;
      }

      const subName = Object.keys(child)[0];
      if (subName === undefined) return;

      const subChildren = child[subName] ?? [];
      generateTreeStringHelpers.drawDirTree(
        context,
        subName,
        subChildren,
        childPrefix,
        childIsLast
      );
    });
  },
};

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
  generateTreeStringHelpers.drawDirTree(context, rootName, children, '', true, true);

  return context.lines.join('\n');
}
