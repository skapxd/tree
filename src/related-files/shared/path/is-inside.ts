import path from 'node:path';

export function isInside(root: string, child: string): boolean {
  const relativePath = path.relative(root, child);
  const hasRelativePath = relativePath.length > 0;
  const escapesRoot = relativePath.startsWith('..');
  const isAbsoluteChild = path.isAbsolute(relativePath);
  return hasRelativePath && !escapesRoot && !isAbsoluteChild;
}
