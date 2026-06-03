import fs from 'fs';
import path from 'path';
import { sortDir } from './utils';
import {
  createIgnoreState,
  isIgnoredPath,
  withGitIgnoreForDir,
  type IgnoreState,
} from './gitignore';

export type TreeStructure = { [key: string]: (string | TreeStructure)[] } | string;

const READ_CHUNK_SIZE = 64 * 1024;

function countFileLines(filePath: string): number | null {
  let fd: number;
  try {
    fd = fs.openSync(filePath, 'r');
  } catch {
    return null;
  }

  const buffer = Buffer.allocUnsafe(READ_CHUNK_SIZE);
  let bytesRead = 0;
  let totalBytes = 0;
  let lineBreaks = 0;
  let lastByte: number | null = null;

  try {
    do {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (bytesRead > 0) {
        totalBytes += bytesRead;
        lastByte = buffer[bytesRead - 1]!;

        for (let i = 0; i < bytesRead; i++) {
          if (buffer[i] === 10) {
            lineBreaks++;
          }
        }
      }
    } while (bytesRead > 0);
  } catch {
    return null;
  } finally {
    fs.closeSync(fd);
  }

  if (totalBytes === 0) return 0;
  return lineBreaks + (lastByte === 10 ? 0 : 1);
}

function formatFileName(filePath: string): string {
  const fileName = path.basename(filePath);
  const lines = countFileLines(filePath);
  if (lines === null) return fileName;

  return `${fileName} (${lines} ${lines === 1 ? 'line' : 'lines'})`;
}

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
  let stats: fs.Stats;
  try {
    stats = fs.lstatSync(dirPath);
  } catch (e) {
    return null;
  }

  if (stats.isDirectory()) {
    const activeIgnoreState = withGitIgnoreForDir(
      ignoreState ?? createIgnoreState(dirPath, ignoreRegex),
      dirPath
    );

    const dir = fs.readdirSync(dirPath);

    // Map children to their structure
    const children = dir
      .filter((child) => {
        const childPath = path.join(dirPath, child);
        try {
            const childStats = fs.lstatSync(childPath);
            if (isIgnoredPath(activeIgnoreState, childPath, child, childStats.isDirectory())) {
              return false;
            }
            return onlyFolder ? childStats.isDirectory() : true;
        } catch {
            return false;
        }
      })
      .map((child) => {
        return dirToJson(path.join(dirPath, child), ignoreRegex, onlyFolder, activeIgnoreState);
      })
      .filter((c): c is TreeStructure => c !== null); // Filter out nulls

    const dirName = path.basename(dirPath);
    const structure: TreeStructure = {};
    // @ts-expect-error - sortDir returns (string|object)[], compatible with TreeStructure's array
    structure[dirName] = sortDir(children);
    return structure;
  } else {
    return stats.isFile() ? formatFileName(dirPath) : path.basename(dirPath);
  }
}
