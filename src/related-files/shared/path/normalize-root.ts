import path from 'node:path';

export function normalizeRoot(root: string): string {
  return path.resolve(root);
}
