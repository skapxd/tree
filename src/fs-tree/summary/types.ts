export type TreeSummaryFile = {
  path: string;
  lines: number;
  characters: number;
  estimatedTokens: number;
  maxLineLength: number;
};

export type TreeSummary = {
  rootPath: string;
  directoryCount: number;
  fileCount: number;
  totalLineCount: number;
  totalCharacterCount: number;
  maxLineLength: number;
  fileWithoutTextStatsCount: number;
  onlyFolder: boolean;
  extensionCounts: Map<string, number>;
  lineCounts: number[];
  characterCounts: number[];
  largestFiles: TreeSummaryFile[];
};
