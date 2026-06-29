import { type Section } from '@/file-tree/types';

export type TreeNode = {
  section: Section;
  children: TreeNode[];
};

/**
 * Converts a flat list of sections into a hierarchical tree based on 'level'.
 */
export function buildTreeFromSections(sections: Section[]): TreeNode[] {
  const root: TreeNode = {
    section: { level: 0, title: 'root', startLine: 0, endLine: 0, fullHeading: '' },
    children: [],
  };
  const stack: TreeNode[] = [root];

  for (const section of sections) {
    const node: TreeNode = { section, children: [] };

    while (stack.length > 1) {
      const currentParent = stack[stack.length - 1];
      const foundParent = currentParent !== undefined && currentParent.section.level < section.level;
      if (foundParent) break;

      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent === undefined) continue;

    parent.children.push(node);
    stack.push(node);
  }

  return root.children;
}
