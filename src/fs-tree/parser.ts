import fs from 'fs';
import path from 'path';
import { sortDir } from './utils';

export type TreeStructure = { [key: string]: (string | TreeStructure)[] } | string;

/**
 * Recursively scans a directory and returns a JSON-like structure.
 * @param dirPath - The path to scan.
 * @param ignoreRegex - The regex to filter file/folder names.
 * @param onlyFolder - If true, only include directories.
 */
export function dirToJson(
  dirPath: string,
  ignoreRegex: RegExp | null,
  onlyFolder?: boolean
): TreeStructure | null {
  let stats: fs.Stats;
  try {
    stats = fs.lstatSync(dirPath);
  } catch (e) {
    return null;
  }

  if (stats.isDirectory()) {
    let dir = fs.readdirSync(dirPath);

    if (ignoreRegex) {
      dir = dir.filter((val) => {
        return !ignoreRegex.test(val);
      });
    }

    // Map children to their structure
    const children = dir
      .filter((child) => {
        const childPath = path.join(dirPath, child);
        try {
            const childStats = fs.lstatSync(childPath);
            return onlyFolder ? childStats.isDirectory() : true;
        } catch {
            return false;
        }
      })
      .map((child) => {
        return dirToJson(path.join(dirPath, child), ignoreRegex, onlyFolder);
      })
      .filter((c): c is TreeStructure => c !== null); // Filter out nulls

    const dirName = path.basename(dirPath);
    const structure: TreeStructure = {};
    // @ts-expect-error - sortDir returns (string|object)[], compatible with TreeStructure's array
    structure[dirName] = sortDir(children);
    return structure;
  } else {
    return path.basename(dirPath);
  }
}
