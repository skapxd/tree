import { buildTreeFromSections, type TreeNode } from '@/file-tree/sections/build-tree-from-sections';
import { type Section } from '@/file-tree/types';

const COL_LINES_WIDTH = 12;
const COL_TYPE_WIDTH = 10;
const SYMBOL_SEPARATOR_WIDTH = 40;

const outlineHelpers = {
  drawLegacyTree(lines: string[], nodes: TreeNode[], prefix = ''): void {
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      lines.push(`${outlineHelpers.formatCols(node.section)} ${prefix}${connector}${node.section.title}`);

      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      outlineHelpers.drawLegacyTree(lines, node.children, childPrefix);
    });
  },

  formatCols(section: Section): string {
    const range = `${section.startLine}-${section.endLine}`.padStart(COL_LINES_WIDTH);
    const rawLabel = section.kind ?? 'item';
    const [firstLabel] = rawLabel.split(' ');
    const label = firstLabel ?? 'item';
    const exceedsTypeWidth = label.length > COL_TYPE_WIDTH - 2;
    const visibleLabel = exceedsTypeWidth
      ? label.substring(0, COL_TYPE_WIDTH - 2)
      : label;
    const kindCol = visibleLabel.padEnd(COL_TYPE_WIDTH);

    return `${range} │ ${kindCol} │`;
  },

  formatHeader(): string[] {
    const linesHeader = 'Lines'.padStart(COL_LINES_WIDTH);
    const typeHeader = 'Type'.padEnd(COL_TYPE_WIDTH);
    const symbolHeader = ' Symbol';

    return [
      '',
      `${linesHeader} │ ${typeHeader} │${symbolHeader}`,
      `${'─'.repeat(COL_LINES_WIDTH + 1)}┼${'─'.repeat(COL_TYPE_WIDTH + 2)}┼${'─'.repeat(SYMBOL_SEPARATOR_WIDTH)}`,
    ];
  },
};

export function formatSingleFileOutline(
  filePath: string,
  lines: string[],
  sections: Section[]
): string {
  void filePath;
  void lines;

  const lacksSections = sections.length === 0;
  if (lacksSections) {
    return '  (No structural elements found)';
  }

  const tree = buildTreeFromSections(sections);
  const outputLines = outlineHelpers.formatHeader();
  outlineHelpers.drawLegacyTree(outputLines, tree);

  return outputLines.join('\n');
}
