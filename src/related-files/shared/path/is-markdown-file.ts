import path from 'node:path';

export function isMarkdownFile(filePath: string): boolean {
  const extension = path.extname(filePath).toLowerCase();
  return extension === '.md' || extension === '.markdown';
}
