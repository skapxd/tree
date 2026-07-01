import path from 'node:path';
import { type TreeSummary } from './types';

export function createTreeSummary(rootPath: string, onlyFolder: boolean): TreeSummary {
  return {
    rootPath: path.resolve(rootPath),
    directoryCount: 0,
    fileCount: 0,
    totalLineCount: 0,
    unreadableFileCount: 0,
    onlyFolder,
    extensionCounts: new Map(),
    lineCounts: [],
    largestFiles: [],
  };
}
