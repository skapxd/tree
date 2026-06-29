import path from 'node:path';
import { toPosixPath } from './to-posix-path';

export function formatProjectPath(root: string, file: string): string {
  return toPosixPath(path.relative(root, file));
}
