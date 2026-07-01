import path from 'node:path';

export function formatRelativePath(rootPath: string, filePath: string): string {
  const relativePath = path.relative(rootPath, filePath);
  const displayPath = relativePath === '' ? path.basename(filePath) : relativePath;

  return displayPath.split(path.sep).join('/');
}
