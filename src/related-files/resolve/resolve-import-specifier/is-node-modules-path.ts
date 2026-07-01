import path from 'node:path';

export function isNodeModulesPath(filePath: string): boolean {
  return path.normalize(filePath).split(path.sep).includes('node_modules');
}
