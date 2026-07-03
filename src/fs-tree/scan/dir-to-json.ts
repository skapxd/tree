import path from 'node:path';
import { createIgnoreState } from '@/fs-tree/ignore/create-ignore-state';
import { sortDir } from './sort-dir';
import { withGitIgnoreForDir } from '@/fs-tree/ignore/with-git-ignore-for-dir';
import { type IgnoreState } from '@/fs-tree/ignore/gitignore-helpers';
import { type TreeSummary } from '@/fs-tree/summary';
import { formatSymbolicLinkLabel } from '@/shared/symlink';
import { formatFileName } from './dir-to-json/format-file-name';
import { getFileTextStats } from './dir-to-json/get-file-text-stats';
import { readDir } from './dir-to-json/read-dir';
import { readStats } from './dir-to-json/read-stats';
import { recordDirectory } from './dir-to-json/record-directory';
import { recordFile } from './dir-to-json/record-file';
import { shouldKeepChild } from './dir-to-json/should-keep-child';

export type TreeStructure = { [key: string]: (string | TreeStructure)[] } | string;

/**
 * Recursively scans a directory and returns a JSON-like structure.
 * @param dirPath - The path to scan.
 * @param ignoreRegex - The regex to filter file/folder names and root-relative paths.
 * @param onlyFolder - If true, only include directories.
 */
export function dirToJson(
  dirPath: string,
  ignoreRegex: RegExp | null,
  onlyFolder?: boolean,
  ignoreState?: IgnoreState,
  summary?: TreeSummary
): TreeStructure | null {
  const stats = readStats(dirPath);
  if (stats === null) return null;

  const isDirectory = stats.isDirectory();
  const isFile = stats.isFile();
  const isSymbolicLink = stats.isSymbolicLink();
  if (isSymbolicLink) return formatSymbolicLinkLabel(dirPath);

  const isSpecialFile = !isDirectory && !isFile;
  if (isSpecialFile) return path.basename(dirPath);

  if (!isDirectory) {
    const stats = getFileTextStats(dirPath);
    recordFile(summary, dirPath, stats);

    return formatFileName(dirPath, stats);
  }

  recordDirectory(summary, dirPath);

  const activeIgnoreState = withGitIgnoreForDir(
    ignoreState ?? createIgnoreState(dirPath, ignoreRegex),
    dirPath
  );
  const dir = readDir(dirPath);
  if (dir === null) return null;

  const children = dir
    .filter(child => shouldKeepChild(
      activeIgnoreState,
      path.join(dirPath, child),
      child,
      onlyFolder
    ))
    .map(child => {
      return dirToJson(
        path.join(dirPath, child),
        ignoreRegex,
        onlyFolder,
        activeIgnoreState,
        summary
      );
    })
    .filter((child): child is TreeStructure => child !== null);
  const dirName = path.basename(dirPath);
  const structure: TreeStructure = {};
  structure[dirName] = sortDir(children);

  return structure;
}
