import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { createIgnoreState } from '@/fs-tree/ignore/create-ignore-state';
import { isIgnoredPath } from '@/fs-tree/ignore/is-ignored-path';
import { sortDir } from './sort-dir';
import { withGitIgnoreForDir } from '@/fs-tree/ignore/with-git-ignore-for-dir';
import { type IgnoreState } from '@/fs-tree/ignore/gitignore-helpers';
import { recordTreeDirectory, recordTreeFile, type TreeSummary } from '@/fs-tree/summary';
import {
  createTextStats,
  formatTextStatsLabel,
  type TextStats,
} from '@/shared/text-stats';

export type TreeStructure = { [key: string]: (string | TreeStructure)[] } | string;

const dirToJsonHelpers = {
  absorbRecoverableBoundaryError(error: unknown): void {
    void error;
  },

  getFileTextStats(filePath: string): TextStats | null {
    const result = trySafe(() => fs.readFileSync(filePath, 'utf8'));
    if (Result.isErr(result)) {
      dirToJsonHelpers.absorbRecoverableBoundaryError(result.error);
      return null;
    }

    return createTextStats(result.value);
  },

  formatFileName(filePath: string, stats: TextStats | null): string {
    const fileName = path.basename(filePath);
    if (stats === null) return fileName;

    return `${fileName} (${formatTextStatsLabel(stats)})`;
  },

  recordDirectory(summary: TreeSummary | undefined, dirPath: string): void {
    if (summary === undefined) return;

    const reachedSummaryRoot = path.resolve(dirPath) === summary.rootPath;
    if (reachedSummaryRoot) return;

    recordTreeDirectory(summary);
  },

  recordFile(summary: TreeSummary | undefined, filePath: string, stats: TextStats | null): void {
    if (summary === undefined) return;

    recordTreeFile(summary, filePath, stats);
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
  ignoreState?: IgnoreState,
  summary?: TreeSummary
): TreeStructure | null {
  const stats = dirToJsonHelpers.readStats(dirPath);
  if (stats === null) return null;

  const isDirectory = stats.isDirectory();
  const isFile = stats.isFile();
  const isSpecialFile = !isDirectory && !isFile;
  if (isSpecialFile) return path.basename(dirPath);

  if (!isDirectory) {
    const stats = dirToJsonHelpers.getFileTextStats(dirPath);
    dirToJsonHelpers.recordFile(summary, dirPath, stats);

    return dirToJsonHelpers.formatFileName(dirPath, stats);
  }

  dirToJsonHelpers.recordDirectory(summary, dirPath);

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
