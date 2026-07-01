import path from 'node:path';

export function isLockFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return fileName.endsWith('.lock') || fileName.includes('-lock.') || fileName === 'bun.lockb';
}
