import { type TreeStructure } from './parser';

const characters = {
  border: '│   ',
  contain: '├── ',
  last: '└── ',
};

let outputString = '';

function resetOutput() {
  outputString = '';
}

/**
 * Recursive function to draw the tree structure.
 */
function drawDirTree(
  name: string,
  children: (string | TreeStructure)[],
  prefix = '',
  isLast = true,
  isRoot = false
) {
  const { border, contain, last } = characters;
  const branch = isRoot ? '' : isLast ? last : contain;

  outputString += (outputString ? '\n' : '') + prefix + branch + name;

  if (Array.isArray(children)) {
    const newPrefix = isRoot ? '' : prefix + (isLast ? '    ' : border);
    children.forEach((child, idx) => {
      const childIsLast = idx === children.length - 1;
      if (typeof child === 'string') {
        outputString += '\n' + newPrefix + (childIsLast ? last : contain) + child;
      } else {
        // child is { subName: [subChildren] }
        const keys = Object.keys(child);
        if (keys.length > 0) {
          const subName = keys[0] as string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subChildren = (child as any)[subName];
          drawDirTree(subName, subChildren, newPrefix, childIsLast, false);
        }
      }
    });
  }
}

/**
 * Main entry point to generate the tree string.
 */
export function generateTreeString(structure: TreeStructure): string {
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
      drawDirTree(rootName, children, '', true, true);
  }

  return outputString;
}
