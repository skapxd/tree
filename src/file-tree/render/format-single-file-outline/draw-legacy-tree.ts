import { type TreeNode } from '@/file-tree/sections/build-tree-from-sections';
import { formatCols } from './format-cols';

export function drawLegacyTree(lines: string[], nodes: TreeNode[], prefix = ''): void {
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(`${formatCols(node.section)} ${prefix}${connector}${node.section.title}`);

    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    drawLegacyTree(lines, node.children, childPrefix);
  });
}
