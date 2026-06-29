import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { createIgnoreState } from '@/fs-tree/ignore/create-ignore-state';
import { isIgnoredPath } from '@/fs-tree/ignore/is-ignored-path';
import { sortDir } from './sort-dir';
import { withGitIgnoreForDir } from '@/fs-tree/ignore/with-git-ignore-for-dir';
import { type IgnoreState } from '@/fs-tree/ignore/gitignore-helpers';

export type TreeStructure = { [key: string]: (string | TreeStructure)[] } | string;

const LINE_BREAK_BYTE = 10;

const dirToJsonHelpers = {
  absorbRecoverableBoundaryError(error: unknown): void {
    void error;
  },

  countFileLines(filePath: string): number | null {
    const result = trySafe(() => fs.readFileSync(filePath));
    if (Result.isErr(result)) {
      dirToJsonHelpers.absorbRecoverableBoundaryError(result.error);
      return null;
    }

    const buffer = result.value;
    const isEmptyFile = buffer.length === 0;
    if (isEmptyFile) return 0;

    let lineBreaks = 0;
    for (const byte of buffer) {
      const isLineBreak = byte === LINE_BREAK_BYTE;
      if (isLineBreak) {
        lineBreaks += 1;
      }
    }

    const lastByte = buffer[buffer.length - 1];
    const endsWithLineBreak = lastByte === LINE_BREAK_BYTE;
    return endsWithLineBreak ? lineBreaks : lineBreaks + 1;
  },

  formatFileName(filePath: string): string {
    const fileName = path.basename(filePath);
    const lines = dirToJsonHelpers.countFileLines(filePath);
    if (lines === null) return fileName;

    return `${fileName} (${lines} ${lines === 1 ? 'line' : 'lines'})`;
  },

  readDir(dirPath: string): string[] | null {
    const result = trySafe(() => fs.readdirSync(dirPath));
    if (Result.isErr(result)) {
      dirToJsonHelpers.absorbRecoverableBoundaryError(result.error);
      return null;
    }

    return result.value;
  },

  readStats(filePath: string): fs.Stats | null {
    const result = trySafe(() => fs.lstatSync(filePath));
    if (Result.isErr(result)) {
      dirToJsonHelpers.absorbRecoverableBoundaryError(result.error);
      return null;
    }

    return result.value;
  },

  shouldKeepChild(
    activeIgnoreState: IgnoreState,
    childPath: string,
    child: string,
    onlyFolder: boolean | undefined
  ): boolean {
    const childStats = dirToJsonHelpers.readStats(childPath);
    if (childStats === null) return false;

    const ignoredPath = isIgnoredPath(
      activeIgnoreState,
      childPath,
      child,
      childStats.isDirectory()
    );
    if (ignoredPath) return false;

    return onlyFolder === true ? childStats.isDirectory() : true;
  },
};

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
  ignoreState?: IgnoreState
): TreeStructure | null {
  const stats = dirToJsonHelpers.readStats(dirPath);
  if (stats === null) return null;

  const isDirectory = stats.isDirectory();
  if (!isDirectory) {
    return stats.isFile() ? dirToJsonHelpers.formatFileName(dirPath) : path.basename(dirPath);
  }

  const activeIgnoreState = withGitIgnoreForDir(
    ignoreState ?? createIgnoreState(dirPath, ignoreRegex),
    dirPath
  );
  const dir = dirToJsonHelpers.readDir(dirPath);
  if (dir === null) return null;

  const children = dir
    .filter(child => dirToJsonHelpers.shouldKeepChild(
      activeIgnoreState,
      path.join(dirPath, child),
      child,
      onlyFolder
    ))
    .map(child => dirToJson(path.join(dirPath, child), ignoreRegex, onlyFolder, activeIgnoreState))
    .filter((child): child is TreeStructure => child !== null);
  const dirName = path.basename(dirPath);
  const structure: TreeStructure = {};
  structure[dirName] = sortDir(children);

  return structure;
}
