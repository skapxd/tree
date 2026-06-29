import path from 'node:path';
import { toPosixPath } from './to-posix-path';

export function isInsideScope(scopeDir: string, filePath: string): string | null {
  const relativePath = path.relative(scopeDir, filePath);
  const hasRelativePath = relativePath.length > 0;
  const escapesScope = relativePath.startsWith('..');
  const isAbsolutePath = path.isAbsolute(relativePath);
  const isInsideScopePath = hasRelativePath && !escapesScope && !isAbsolutePath;

  return isInsideScopePath ? toPosixPath(relativePath) : null;
}
