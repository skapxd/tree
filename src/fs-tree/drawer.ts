import { type TreeStructure } from './parser';

const characters = {
  border: '│   ',
  contain: '├── ',
  last: '└── ',
};

const LINE_COUNT_SUFFIX_REGEX = /^(.*) \((\d+ lines?)\)$/;
const ANSI_DIM = '\x1b[2m';
const ANSI_RESET = '\x1b[0m';

let outputString = '';

function resetOutput() {
  outputString = '';
}

function formatDirectoryName(name: string): string {
  return name.endsWith('/') ? name : `${name}/`;
}

function formatFileName(name: string, color = false): string {
  const match = name.match(LINE_COUNT_SUFFIX_REGEX);
  if (!match) return name;

  const fileName = match[1]!;
  const lineCount = match[2]!;
  const lineCountSuffix = `(${lineCount})`;

  return `${fileName} ${color ? `${ANSI_DIM}${lineCountSuffix}${ANSI_RESET}` : lineCountSuffix}`;
}

export type DrawOptions = {
  color?: boolean;
};

/**
 * Recursive function to draw the tree structure.
 */
function drawDirTree(
  name: string,
  children: (string | TreeStructure)[],
  prefix = '',
  isLast = true,
  isRoot = false,
  options: DrawOptions = {}
) {
  const { border, contain, last } = characters;
  const branch = isRoot ? '' : isLast ? last : contain;

  outputString += (outputString ? '\n' : '') + prefix + branch + formatDirectoryName(name);

  if (Array.isArray(children)) {
    const newPrefix = isRoot ? '' : prefix + (isLast ? '    ' : border);
    children.forEach((child, idx) => {
      const childIsLast = idx === children.length - 1;
      if (typeof child === 'string') {
        outputString += '\n' + newPrefix + (childIsLast ? last : contain) + formatFileName(child, options.color);
      } else {
        // child is { subName: [subChildren] }
        const keys = Object.keys(child);
        if (keys.length > 0) {
          const subName = keys[0] as string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subChildren = (child as any)[subName];
          drawDirTree(subName, subChildren, newPrefix, childIsLast, false, options);
        }
      }
    });
  }
}

/**
 * Main entry point to generate the tree string.
 */
export function generateTreeString(structure: TreeStructure, options: DrawOptions = {}): string {
  resetOutput();

  // If it's just a single file (string), return it
  if (typeof structure === 'string') {
    return structure;
  }

  // It's a directory object { rootName: [...] }
  const rootName = Object.keys(structure)[0];
  if (rootName) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children = (structure as any)[rootName];
      drawDirTree(rootName, children, '', true, true, options);
  }

  return outputString;
}
