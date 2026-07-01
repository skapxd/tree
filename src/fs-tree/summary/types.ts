export type TreeSummaryFile = {
  path: string;
  lines: number;
};

export type TreeSummary = {
  rootPath: string;
  directoryCount: number;
  fileCount: number;
  totalLineCount: number;
  unreadableFileCount: number;
  onlyFolder: boolean;
  extensionCounts: Map<string, number>;
  lineCounts: number[];
  largestFiles: TreeSummaryFile[];
};
