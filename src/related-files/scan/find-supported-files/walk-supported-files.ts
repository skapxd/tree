import path from 'node:path';
import { type IgnoreState } from '@/fs-tree/gitignore';
import { isSupportedFile } from '@/related-files/shared/path';
import { readDirectory } from './read-directory';
import { readStats } from './read-stats';
import { shouldIgnorePath } from './should-ignore-path';

export function walkSupportedFiles(
  root: string,
  currentPath: string,
  state: IgnoreState,
  customIgnore: RegExp | null,
  files: string[]
): void {
  const directoryRead = readDirectory(currentPath, state);
  if (directoryRead === null) return;

  for (const entry of directoryRead.entries) {
    const absolutePath = path.join(currentPath, entry);
    const stats = readStats(absolutePath);
    if (stats === null) continue;

    const isDirectory = stats.isDirectory();
    const isIgnored = shouldIgnorePath(
      directoryRead.activeState,
      root,
      absolutePath,
      entry,
      isDirectory,
      customIgnore
    );
    if (isIgnored) {
      continue;
    }

    if (isDirectory) {
      walkSupportedFiles(
        root,
        absolutePath,
        directoryRead.activeState,
        customIgnore,
        files
      );
      continue;
    }

    const isSupportedRegularFile =
      stats.isFile() && isSupportedFile(absolutePath);
    if (isSupportedRegularFile) {
      files.push(path.resolve(absolutePath));
    }
  }
}
