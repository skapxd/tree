import fs from 'fs';
import { type Section } from './types';

/**
 * Reads a file from disk safely.
 */
export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

export interface TreeNode {
  section: Section;
  children: TreeNode[];
}

/**
 * Converts a flat list of sections into a hierarchical tree based on 'level'.
 */
export function buildTreeFromSections(sections: Section[]): TreeNode[] {
  // Mock root node (level 0)
  const root: TreeNode = { 
      section: { level: 0, title: 'root', startLine: 0, endLine: 0, fullHeading: '' }, 
      children: [] 
  };
  
  const stack: TreeNode[] = [root];

  for (const section of sections) {
    const node: TreeNode = { section, children: [] };
    
    // Pop stack until we find the parent (level < current level)
    while (stack.length > 1 && stack[stack.length - 1]!.section.level >= section.level) {
      stack.pop();
    }
    
    // Add to parent
    stack[stack.length - 1]!.children.push(node);
    
    // Push current node to stack so it can be parent of next items
    stack.push(node);
  }

  return root.children;
}