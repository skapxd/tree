#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { getParser, findSection, readFile, type Section, buildTreeFromSections, type TreeNode } from './index.js';

// --- Unified Tree Model ---
interface VisualNode {
    label: string;
    meta?: string;
    children?: VisualNode[];
    isLast?: boolean; // Helper for drawing
}

// --- File System Walker ---
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage', '.gemini-clipboard', '.next', '.turbo']);

function buildSemanticTree(currentPath: string): VisualNode | null {
    const stats = fs.statSync(currentPath);
    const name = path.basename(currentPath);

    if (stats.isDirectory()) {
        if (IGNORE_DIRS.has(name)) return null;

        const children: VisualNode[] = [];
        const entries = fs.readdirSync(currentPath).sort(); // Sort for consistent tree

        for (const entry of entries) {
            const childNode = buildSemanticTree(path.join(currentPath, entry));
            if (childNode) {
                children.push(childNode);
            }
        }

        // If directory is empty or all children were ignored
        if (children.length === 0) return null;

        return {
            label: `${name}/`,
            children
        };
    } else {
        // It's a file
        // Try to outline it
        try {
            // Only attempt to parse known extensions or text files
            // For now, let's just try getParser logic
            // But we don't want to fail hard on binary files
            
            // Check extension
            const ext = path.extname(currentPath).toLowerCase();
            const supported = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.md', '.markdown', '.astro'];
            
            if (!supported.includes(ext)) {
                 return { label: name }; // Just file name
            }

            const content = fs.readFileSync(currentPath, 'utf-8');
            const parser = getParser(currentPath);
            const { sections } = parser.parse(content);

            if (sections.length === 0) {
                return { label: name };
            }

            // Convert Outline Sections to VisualNodes
            const sectionNodes = convertSectionsToNodes(sections);
            
            return {
                label: name,
                children: sectionNodes
            };

        } catch (e) {
            // If read fails (binary, etc), just return name
            return { label: name };
        }
    }
}

function convertSectionsToNodes(sections: Section[]): VisualNode[] {
    const tree = buildTreeFromSections(sections);
    
    function mapNode(node: TreeNode): VisualNode {
        // Format meta info like [kind]
        let label = (node.section.kind || 'item').split(' ')[0];
        const kind = `[${label}]`;
        
        return {
            label: node.section.title,
            meta: kind,
            children: node.children.map(mapNode)
        };
    }

    return tree.map(mapNode);
}

// --- Tree Drawer ---
function drawVisualTree(nodes: VisualNode[], prefix = '') {
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        // Format: [meta] Label
        let line = '';
        if (node.meta) {
            // Align meta nicely? For now just append
             // We want the tree structure on the LEFT, like standard `tree`
             // prefix + connector + meta + label
             line = `${prefix}${connector}${node.meta.padEnd(7)} ${node.label}`;
        } else {
             // Directory or File
             line = `${prefix}${connector}${node.label}`;
        }
        
        console.log(line);
        
        if (node.children && node.children.length > 0) {
            const childPrefix = prefix + (isLast ? '    ' : '│   ');
            drawVisualTree(node.children, childPrefix);
        }
    });
}


// --- Legacy Single File Outline Drawer (for backwards compat / extracting) ---
function formatCols(section: Section): string {
    const range = `${section.startLine}-${section.endLine}`.padStart(11);
    let label = (section.kind || 'item').split(' ')[0];
    const kindCol = `[${label}]`.padEnd(9); 
    return `${range} ${kindCol}`;
}

function drawLegacyTree(nodes: TreeNode[], prefix = '') {
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        console.log(`${formatCols(node.section)} │ ${prefix}${connector}${node.section.title}`);
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        drawLegacyTree(node.children, childPrefix);
    });
}

function showSingleFileOutline(filePath: string, lines: string[], sections: Section[]): void {
  if (sections.length === 0) {
    console.log('  (No structural elements found)');
  } else {
      const tree = buildTreeFromSections(sections);
      drawLegacyTree(tree);
  }
}

function extractSectionOutput(lines: string[], section: Section): void {
  console.log(`\n📍 Extracting: ${section.fullHeading}`);
  console.log(
    `📏 Lines ${section.startLine}-${section.endLine} (${
      section.endLine - section.startLine + 1
    } lines)\n`
  );
  console.log('─'.repeat(70));
  for (let i = section.startLine - 1; i < section.endLine; i++) {
    const lineNum = String(i + 1).padStart(5);
    console.log(`${lineNum} │ ${lines[i]}`);
  }
  console.log('─'.repeat(70));
  console.log('');
}

// CLI Configuration
program
  .name('file-tree')
  .description('Powerful structural navigator for Markdown, Code, and Directories.')
  .version('1.1.0')
  .argument('<path>', 'File or Directory path')
  .argument('[pattern]', 'Partial text to extract a specific section (only for single file)')
  .action((targetPath: string, headingPattern?: string) => {
    try {
      const stats = fs.statSync(targetPath);

      // --- Directory Mode (Semantic Tree) ---
      if (stats.isDirectory()) {
          if (headingPattern) {
              console.error("❌ Pattern extraction is not supported for directories yet.");
              process.exit(1);
          }
          
          console.log(`\n📂 Semantic Tree for: ${targetPath}\n`);
          const treeRoot = buildSemanticTree(targetPath);
          if (treeRoot && treeRoot.children) {
              drawVisualTree(treeRoot.children);
          } else {
              console.log("  (Empty directory or no supported files)");
          }
          return;
      }

      // --- Single File Mode ---
      const content = readFile(targetPath);
      const parser = getParser(targetPath);
      const { lines, sections } = parser.parse(content);

      if (!headingPattern) {
        showSingleFileOutline(targetPath, lines, sections);
        return;
      }

      const section = findSection(sections, headingPattern);

      if (!section) {
        console.error(`❌ No section found matching: "${headingPattern}"`);
        // ... (Show suggestions)
        process.exit(1);
      }

      extractSectionOutput(lines, section);

    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.error('❌ An unknown error occurred');
      }
      process.exit(1);
    }
  });

program.parse(process.argv);