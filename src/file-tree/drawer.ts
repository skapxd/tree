import { type Section } from './types';
import { type TreeNode, buildTreeFromSections } from './utils';

const COL_LINES_WIDTH = 12;
const COL_TYPE_WIDTH = 10;

function formatCols(section: Section): string {
    const range = `${section.startLine}-${section.endLine}`.padStart(COL_LINES_WIDTH);
    
    let label = (section.kind || 'item').split(' ')[0] || 'item';
    // Truncate if too long, though improbable for standard kinds
    if (label.length > COL_TYPE_WIDTH - 2) { 
        label = label.substring(0, COL_TYPE_WIDTH - 2); 
    }
    const kindCol = label.padEnd(COL_TYPE_WIDTH);
    
    return `${range} │ ${kindCol} │`;
}

function drawLegacyTree(nodes: TreeNode[], prefix = '') {
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        // Print row
        console.log(`${formatCols(node.section)} ${prefix}${connector}${node.section.title}`);
        
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        drawLegacyTree(node.children, childPrefix);
    });
}

function printHeader() {
    const linesHeader = 'Lines'.padStart(COL_LINES_WIDTH);
    const typeHeader = 'Type'.padEnd(COL_TYPE_WIDTH);
    const symbolHeader = ' Symbol';

    console.log(`
${linesHeader} │ ${typeHeader} │${symbolHeader}`);
    console.log(`${'─'.repeat(COL_LINES_WIDTH + 1)}┼${'─'.repeat(COL_TYPE_WIDTH + 2)}┼${'─'.repeat(40)}`);
}

export function showSingleFileOutline(filePath: string, lines: string[], sections: Section[]): void {
  if (sections.length === 0) {
    console.log('  (No structural elements found)');
  } else {
      const tree = buildTreeFromSections(sections);
      printHeader();
      drawLegacyTree(tree);
      console.log(''); // Empty line at the end
  }
}